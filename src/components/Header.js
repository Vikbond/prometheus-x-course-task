import { Link, NavLink } from "react-router-dom";

function Header({ username, onSignOut, cartCount }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/books">
        X-course task / Прізвище Ім’я
      </Link>
      <nav className="user-nav" aria-label="Основна навігація">
        <NavLink className="nav-link" to="/books">
          Книги
        </NavLink>
        <NavLink className="cart-link" to="/cart" aria-label={`Кошик, ${cartCount} товарів`}>
          <img src={`${process.env.PUBLIC_URL || "."}/assets/cart.svg`} alt="" width="36" height="36" />
          <span>Кошик{cartCount > 0 ? ` (${cartCount})` : ""}</span>
        </NavLink>
        {username ? (
          <>
            <span className="header-username">{username}</span>
            <button className="button button-secondary" onClick={onSignOut} type="button">
              Sign-Out
            </button>
          </>
        ) : (
          <NavLink className="button button-secondary" to="/signin">
            Увійти
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;
