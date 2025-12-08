import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RulesPage from "./pages/RulesPage";
import GamePage from "./pages/GamePage";
import ThankYou from "./pages/ThankYou";
import GameAuthHandler from "./pages/GameAuthHandler";

import { ThemeProvider } from "./contexts/ThemeContext";

function ProtectedRoute({ children }) {
  const sessionId = localStorage.getItem("sessionId");
  return sessionId ? children : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>

         
          <Route path="/auth" element={<GameAuthHandler />} />

          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rules"
            element={
              <ProtectedRoute>
                <RulesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />

          <Route path="/thankyou" element={<ThankYou />} />

         
          <Route path="*" element={<Navigate to="/auth" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
