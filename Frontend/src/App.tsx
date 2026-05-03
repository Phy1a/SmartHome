import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Applayout from "./pages/AppLayout";
import Home from "./pages/Home";
import Form from "./pages/Form";
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
            <Home></Home>
          </Applayout>
        }
      />
      <Route
        path="/connexion"
        element={
          <Applayout title="Connexion">
            {" "}
            <Form></Form>
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
      <AppRoutes />
    </BrowserRouter>
  );
}
