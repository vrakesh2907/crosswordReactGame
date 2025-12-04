import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RulesPage from "./pages/RulesPage";
import GamePage from "./pages/GamePage";
import ThankYou from "./pages/ThankYou";

import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/thankyou" element={<ThankYou />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
