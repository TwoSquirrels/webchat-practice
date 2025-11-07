"use server";

export async function authenticateWithCode(code: string) {
  try {
    const response = await fetch("http://localhost:3001/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to authenticate" };
    }

    const data = await response.json();

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: String(error) };
  }
}
