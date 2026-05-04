import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Applayout from "./pages/AppLayout";
import Home from "./pages/Home";
import { RegisterPage, LoginPage } from "./pages/AuthPages";
import { AuthProvider } from "./hooks/useAuth";
//import About from "./pages/About";
//import Contact from "./pages/Contact";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Applayout title="Accueil">
            <Home />
          </Applayout>
        }
      />
      <Route
        path="/connexion"
        element={
          <Applayout title="Connexion">
            <LoginPage />
          </Applayout>
        }
      />
      <Route
        path="/inscription"
        element={
          <Applayout title="Inscription">
            <RegisterPage />
          </Applayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
