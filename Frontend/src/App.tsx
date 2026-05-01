import { createBrowserRouter, Outlet } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Form from "./pages/Form";
//import About from "./pages/About";
//import Contact from "./pages/Contact";

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, //default page
      { path: "connexion", element: <Form /> },
    ],
  },
]);
