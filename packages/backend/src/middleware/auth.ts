import { Context, Next } from "hono";
import { verifyToken } from "../auth";

interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace hono {
    interface ContextData {
      authPayload?: AuthPayload;
    }
  }
}

export async function verifyAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("authPayload", payload);
  await next();
}

export function getAuthPayload(c: Context): AuthPayload {
  const payload = c.get("authPayload");
  if (!payload) {
    throw new Error(
      "Auth payload not found. Ensure verifyAuthMiddleware is applied.",
    );
  }
  return payload;
}
