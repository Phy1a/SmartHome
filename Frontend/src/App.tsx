import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Applayout from "./pages/AppLayout";
import Home from "./pages/Home";
import { RegisterPage, LoginPage } from "./pages/AuthPages";
import { AuthProvider } from "./hooks/useAuth";
import PublicPage from "./pages/PublicPage";
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
      <Route
        path="/page-publique"
        element={
          <Applayout title="Connexion">
            {" "}
            <PublicPage></PublicPage>
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

// export default function App() {
//   return <h1>Test</h1>;
// }
