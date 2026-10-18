import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useBooks } from "./context/BooksContext";
import BookList from "./pages/BookList";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SpecificBook from "./pages/SpecificBook";

function ProtectedRoute({ username, children }) {
  const location = useLocation();
  return username
    ? children
    : <Navigate to="/signin" state={{ from: location }} replace />;
}

function App() {
  const navigate = useNavigate();
  const { cart } = useBooks();
  const [username, setUsername] = useState(
    () => window.localStorage.getItem("x-course-username") || "",
  );

  function signIn(name) {
    window.localStorage.setItem("x-course-username", name);
    setUsername(name);
  }

  function signOut() {
    window.localStorage.removeItem("x-course-username");
    setUsername("");
    navigate("/signin", { replace: true });
  }

  return (
    <div className="app-shell">
      <Header username={username} onSignOut={signOut} cartCount={cart.reduce((sum, item) => sum + item.count, 0)} />
      <main className="page-content">
        <Routes>
          <Route path="/signin" element={<SignIn username={username} onSignIn={signIn} />} />
          <Route
            path="/books"
            element={
              <ProtectedRoute username={username}>
                <BookList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute username={username}>
                <SpecificBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute username={username}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={username ? "/books" : "/signin"} replace />}
          />
          <Route
            path="*"
            element={
              <ProtectedRoute username={username}>
                <NotFound />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
