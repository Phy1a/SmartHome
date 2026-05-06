import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Applayout from "./pages/AppLayout";
import { RegisterPage, LoginPage } from "./pages/AuthPages";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import PublicPage from "./pages/PublicPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import NotLoggedRedirect from "./utils/NotLoggedRedirect";
//import About from "./pages/About";
//import Contact from "./pages/Contact";

function AppRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Applayout title="Accueil">
            {!user ? <PublicPage /> : <Dashboard></Dashboard>}
          </Applayout>
        }
      />
      <Route
        path="/connexion"
        element={
          !user ? ( // stop the user to access log in page if he is already connected
            <Applayout title="Connexion">
              <LoginPage />
            </Applayout>
          ) : (
            <Navigate to={"/"}></Navigate>
          )
        }
      />
      <Route
        path="/inscription"
        element={
          !user ? ( // stop the user to access log in page if he is already connected
            <Applayout title="Inscription">
              <RegisterPage />
            </Applayout>
          ) : (
            <Navigate to={"/"}></Navigate>
          )
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
            <NotLoggedRedirect>
              <ProfilePage></ProfilePage>
            </NotLoggedRedirect>
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
