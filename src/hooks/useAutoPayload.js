export function generateSubmitPayload(score, time) {
  const userId = crypto.randomUUID();
  return {
    organizationName: "",
    subDomain: "",
    companyLogo: "https://staging-games.extramileplay.com/imp/logo/extramileplay-new.png",
    logocss: "",
    userPlayedCount: 0,

   // userId: "4ea9239e-37dc-4267-b7f4-0754794f5b85",
   userId: userId,
    organizationId: "9991e14e-2305-4086-8d75-9cd2e35913bc",

   
    firstName: "Guest",
    lastName: "User",

    sessionId: "4b13c138-8ccf-4331-8430-3b2d5c746a24",
    businessUnit: "",

    email: "test@gmail.com",
    roles: "GUEST_USER",

    token: "4ea9239e-37dc-4267-b7f4-0754794f5b85",

    v_gameId: "16999d08-0435-4690-a806-a8baef65abfc",
    employeeId: "",
    gameId: "16999d08-0435-4690-a806-a8baef65abfc",

    additionalFields: {
      email: "test@gmail.com",
    },

    gameRedirect:
      "https://staging.extramileplay.com/game-detail/16999d08-0435-4690-a806-a8baef65abfc",

    timer: time || "00:00",
    points: score || 0,
  };
}
