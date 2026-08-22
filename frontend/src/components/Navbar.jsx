import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true" />
          <span>Pathward</span>
        </Link>
        <nav className="navbar__links">
          <Link to="/engineering">Engineering</Link>
          <a href="#faq">How it works</a>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard{user.isPremium ? " ★" : ""}</Link>
              <button className="navbar__logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="navbar__cta">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
