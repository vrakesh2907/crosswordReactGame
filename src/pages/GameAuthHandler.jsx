import { useEffect, useState } from "react";
import { loginWithOtp } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function GameAuthHandler() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Checking login…");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function autoLogin() {
      const params = new URLSearchParams(window.location.search);

      const otp = params.get("otp");
      const role = params.get("role");

      console.log("🔍 URL params:", { otp, role });

      if (!otp) {
        setMessage("Missing OTP parameter");
        setIsLoading(false);
        return;
      }

      try {
        setMessage("🔐 Logging you in…");
        setIsLoading(true);

       
        localStorage.clear();

        
        const data = await loginWithOtp(otp, role);

        console.log("Login successful:", data);

       
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("organizationId", data.organizationId);
        localStorage.setItem("gameId", data.gameId);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("firstName", data.firstName);
        localStorage.setItem("lastName", data.lastName);
        localStorage.setItem("role", data.role?.toUpperCase());


         if (data.token && data.role?.toUpperCase() !== "GUEST_USER") {
          localStorage.setItem("token", data.token);
        }

        if (data.userCustomFieldsData) {
          localStorage.setItem(
            "userCustomFieldsData",
            JSON.stringify(data.userCustomFieldsData)
          );
        }

       
        window.dispatchEvent(new Event("refresh-theme"));

        setMessage("Login successful! Redirecting…");

        setTimeout(() => {
          setIsLoading(false);
          navigate("/");
        }, 700);
      } catch (err) {
        console.error("Auto-login failed:", err);
        setMessage(`Login failed: ${err.message}`);
        setIsLoading(false);
      }
    }

    autoLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
       
        {isLoading && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
          </div>
        )}

       
        {!isLoading && (
          <div className="mb-6">
            {message.includes("failed") ? (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-4xl">✕</span>
              </div>
            ) : (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 text-4xl">✓</span>
              </div>
            )}
          </div>
        )}

        <div className="text-2xl font-bold text-gray-800 mb-3">{message}</div>

        {message.includes("failed") && !isLoading && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Please check your URL parameters and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-gray-500 mt-4 animate-pulse">
            Please wait while we set up your session...
          </p>
        )}
      </div> */}
    </div>
  );
}
