import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout.js";
import { HomePage } from "./pages/HomePage.js";
import { RecipesPage } from "./pages/RecipesPage.js";
import { RecipeDetailPage } from "./pages/RecipeDetailPage.js";
import { CategoryPage } from "./pages/CategoryPage.js";
import { FavoritesPage } from "./pages/FavoritesPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "recipes",
        element: <RecipesPage />,
      },
      {
        path: "recipes/:slug",
        element: <RecipeDetailPage />,
      },
      {
        path: "categories/:slug",
        element: <CategoryPage />,
      },
      {
        path: "favorites",
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
