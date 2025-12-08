const BASE_URL = "https://api-staging.extramileplay.com";
const CLIENT_SECRET = "c8cd8589f49601a287b0e269f43cca07a31858c91918c1479e325b96a1d1d239";

export async function loginWithOtp(otp, role) {
  if (!otp) throw new Error("OTP is required");


  const formattedRole = role?.toUpperCase()?.trim();
  const isGuest = formattedRole === "GUEST_USER";


  const endpoint = isGuest
    ? `${BASE_URL}/game-server/guest/login`
    : `${BASE_URL}/game-server/login`;

 
  const payload = isGuest ? { otp, role: "GUEST_USER" } : { otp };

  console.log("🔐 Login attempt →", { endpoint, payload });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "client-secret": CLIENT_SECRET,
        "Content-Type": "application/json",
        "Idempotency-Key": `otp-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    console.log("Login response →", json);

    if (!res.ok) {
      throw new Error(json.message || "Login failed");
    }

    const d = json.data;

  
    if (!d.sessionId || !d.organizationId) {
      throw new Error("Invalid login response: missing sessionId or organizationId");
    }

    
    const normalized = {
      sessionId: d.sessionId,
      organizationId: d.organizationId,
      gameId: d.gameId,
      userId: d.id,
      email: d.email || d.userCustomFieldsData?.email || "",
      firstName: d.firstName || d.userCustomFieldsData?.firstName || "",
      lastName: d.lastName || d.userCustomFieldsData?.lastName || "",
      role: d.role || (isGuest ? "GUEST_USER" : "PUBLIC_USER"),
      userPlayedCount: d.userPlayedCount ?? 0,
      businessUnit: d.businessUnit || "",
      userCustomFieldsData: d.userCustomFieldsData || {},
    };

 
    localStorage.setItem("sessionId", normalized.sessionId);
    localStorage.setItem("organizationId", normalized.organizationId);
    localStorage.setItem("role", normalized.role);

   
    window.dispatchEvent(new Event("refresh-theme"));

    return normalized;
  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
}
