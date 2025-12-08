export function generateSubmitPayload(score, time) {
  const sessionId = localStorage.getItem("sessionId");
  const organizationId = localStorage.getItem("organizationId");
  const gameId = localStorage.getItem("gameId");
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");
  const role = (localStorage.getItem("role") || "PUBLIC_USER").toUpperCase();
  const token = localStorage.getItem("token");

  let firstName = localStorage.getItem("firstName");
  let lastName = localStorage.getItem("lastName");

  if (!firstName || firstName === "null" || firstName === "undefined") {
    firstName = " ";
  }
  if (!lastName || lastName === "null" || lastName === "undefined") {
    lastName = " ";
  }

  if (!sessionId || !organizationId || !gameId || !userId) {
    console.error("❌ Missing core submission fields:", {
      sessionId,
      organizationId,
      gameId,
      userId,
    });
    return null;
  }

  const payload = {
    userId,
    gameId,
    roles: role,
    email,
    organizationId,
    sessionId,
    firstName,
    lastName,
    timer: time ?? "00:00",
    points: score ?? 0,
  };

 
  if (role !== "GUEST_USER" && token) {
    payload.token = token;
  }

  return payload;
}
