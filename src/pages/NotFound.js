import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found-code">404</p>
      <h1>Сторінку не знайдено</h1>
      <p>Oops, something went wrong. 404 error.</p>
      <Link className="button button-primary" to="/books">До каталогу</Link>
    </section>
  );
}

export default NotFound;
