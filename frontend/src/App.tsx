import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Applayout from "./pages/AppLayout";
import Home from "./pages/Home";
import { RegisterPage, LoginPage } from "./pages/AuthPages";
import { AuthProvider } from "./hooks/useAuth";
import PublicPage from "./pages/PublicPage";
import ProfilePage from "./pages/ProfilePage";
//import About from "./pages/About";
//import Contact from "./pages/Contact";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Applayout title="Accueil">
            <PublicPage/>
          </Applayout>
        }
      />
      <Route
        path="/connexion"
        element={
          <Applayout title="Connexion">
            <LoginPage/>
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
      <Route
        path="/page-publique"
        element={
          <Applayout title="Bienvenue">
            <PublicPage></PublicPage>
          </Applayout>
        }
      />
      <Route
        path="/profile"
        element={
          <Applayout title="Profile">
            <ProfilePage></ProfilePage>
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
