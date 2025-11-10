import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "../auth";
import { findUserById, upsertUser } from "../db";
import { verifyAuthMiddleware, getAuthPayload } from "../middleware/auth";
import {
  generateAuthCode,
  getUserByAuthCode,
  getMockUsers,
} from "../mockGoogle";

const authRouter = new Hono();

authRouter.get("/api/mock-users", (c) => {
  return c.json({ users: getMockUsers() });
});

authRouter.get("/auth/google", (c) => {
  const userIndex = Number(c.req.query("user_index") || "0");
  const redirect = c.req.query("redirect");
  const code = generateAuthCode(userIndex);
  let redirectUri = `http://localhost:3000/auth/callback?code=${code}`;
  if (redirect) {
    redirectUri += `&redirect=${encodeURIComponent(redirect)}`;
  }
  return c.redirect(redirectUri);
});

authRouter.post("/auth/token", async (c) => {
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ error: "Code is required" }, 400);
  }

  const googleUser = getUserByAuthCode(code);
  if (!googleUser) {
    return c.json({ error: "Invalid or expired code" }, 400);
  }

  const userId = uuidv4();
  const user = await upsertUser(
    userId,
    googleUser.id,
    googleUser.email,
    googleUser.name,
    googleUser.picture,
  );

  const token = generateToken(user.id, user.email);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

authRouter.get("/api/user", verifyAuthMiddleware, async (c) => {
  const payload = getAuthPayload(c);
  const user = await findUserById(payload.userId);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  });
});

export default authRouter;
