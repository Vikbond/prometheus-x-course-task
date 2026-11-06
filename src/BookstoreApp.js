import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { BookPage, Cart, Catalog, NotFound } from './Storefront';
import { imageUrl, StoreProvider, useStore } from './store';
import './bookstore.css';

const sessionKey = 'x-course-task.session';
const emptySession = { username: '', cart: {} };
const legacyBookIds = new Map([['JavaScript Everywhere', 3]]);

function loadSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(sessionKey));
    if (typeof session?.username === 'string' && session.username &&
        session.cart && typeof session.cart === 'object' && !Array.isArray(session.cart)) {
      return session;
    }
    const username = localStorage.getItem('x-course-username');
    if (username) {
      const items = JSON.parse(localStorage.getItem('x-course-cart'));
      const cart = {};
      if (Array.isArray(items)) {
        for (const item of items) {
          const id = legacyBookIds.get(item?.title);
          if (id && Number.isInteger(item.count) && item.count > 0) {
            cart[id] = Math.min(item.count, 42);
          }
        }
      }
      return { username, cart };
    }
  } catch {
    // The store still works in memory when browser storage is unavailable.
  }
  return emptySession;
}

function Header({ username, onSignOut }) {
  const { cart } = useStore();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to={username ? '/books' : '/signin'}>
          <span className="brand-mark" aria-hidden="true">К</span> Курсовий проєкт
        </Link>
        {username && (
          <nav className="account" aria-label="Мій обліковий запис">
            <Link className="cart-link" to="/cart" aria-label={`Кошик, примірників: ${count}`}>
              <img src={imageUrl('cart.svg')} alt="" width="24" height="24" />
              <strong>Кошик</strong>
              <span aria-hidden="true">{count}</span>
            </Link>
            <button className="button button-outline" type="button" onClick={onSignOut}>Вийти</button>
            <span className="account-name"><img src={imageUrl('avatar.png')} alt="" width="32" height="32" />{username}</span>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      Виконано в <a href="https://prometheus.org.ua/" target="_blank" rel="noreferrer">Prometheus</a> © 2022
    </footer>
  );
}

function SignIn({ onSignIn }) {
  const [value, setValue] = useState('');
  const name = value.trim();
  const length = Array.from(name).length;
  const valid = length >= 4 && length <= 16;

  function submit(event) {
    event.preventDefault();
    if (valid) onSignIn(name);
  }

  return (
    <div className="signin">
      <form className="signin-form" onSubmit={submit}>
        <img className="signin-avatar" src={imageUrl('avatar.png')} alt="" width="160" height="160" />
        <h1>Вхід до магазину</h1>
        <label htmlFor="username">Ім’я користувача</label>
        <input id="username" type="text" autoComplete="username" aria-describedby="username-hint" placeholder="Введіть ім’я" value={value} onChange={(event) => setValue(event.target.value)} />
        <p id="username-hint">Від 4 до 16 символів</p>
        <button className="button" type="submit" disabled={!valid}>Увійти</button>
      </form>
    </div>
  );
}

export default function BookstoreApp() {
  const [session, setSession] = useState(loadSession);
  const { username, cart } = session;
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (session.username) sessionStorage.setItem(sessionKey, JSON.stringify(session));
      else sessionStorage.removeItem(sessionKey);
      localStorage.removeItem('x-course-username');
      localStorage.removeItem('x-course-cart');
    } catch {
      // The active session remains available in memory.
    }
  }, [session]);

  function signIn(name) {
    setSession({ username: name, cart: {} });
    navigate('/books', { replace: true });
  }

  function signOut() {
    setSession(emptySession);
    navigate('/signin', { replace: true });
  }

  function updateCart(update) {
    setSession((current) => ({ ...current, cart: update(current.cart) }));
  }

  return (
    <StoreProvider key={username} active={Boolean(username)} cart={cart} updateCart={updateCart}>
      <Header username={username} onSignOut={signOut} />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Navigate to={username ? '/books' : '/signin'} replace />} />
          <Route path="/signin" element={username ? <Navigate to="/books" replace /> : <SignIn onSignIn={signIn} />} />
          <Route element={username ? <Outlet /> : <Navigate to="/signin" replace />}>
            <Route path="/books" element={<Catalog />} />
            <Route path="/books/:id" element={<BookPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </StoreProvider>
  );
}
