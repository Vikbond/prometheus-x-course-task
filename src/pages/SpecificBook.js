import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useBooks } from "../context/BooksContext";

function SpecificBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, booksStatus, cart, addToCart } = useBooks();
  const [count, setCount] = useState(1);
  const book = books.find((item) => String(item.id) === id);

  useEffect(() => {
    const existingItem = cart.find((item) => String(item.id) === id);
    setCount(existingItem?.count || 1);
  }, [cart, id]);

  function changeCount(value) {
    if (value === "") {
      setCount("");
      return;
    }

    const amount = Number(book?.amount) || 42;
    const nextCount = Number(value);
    if (Number.isFinite(nextCount)) {
      setCount(Math.max(1, Math.min(amount, Math.round(nextCount))));
    }
  }

  function adjustCount(delta) {
    const amount = Number(book?.amount) || 42;
    setCount((currentCount) =>
      Math.max(1, Math.min(amount, (Number(currentCount) || 0) + delta)),
    );
  }

  if (!book) {
    return (
      <p className="catalog-status" role="status">
        {booksStatus || "Книгу не знайдено."}
      </p>
    );
  }

  return (
    <article className="specific-book">
      <div className="specific-book-cover">
        <img
          src={`${process.env.PUBLIC_URL || "."}/assets/${book.image}`}
          alt={`Обкладинка книги «${book.title}»`}
          onError={(event) => {
            if (!event.currentTarget.src.endsWith("/imageNotFound.png")) {
              event.currentTarget.src = `${process.env.PUBLIC_URL || "."}/assets/imageNotFound.png`;
            }
          }}
        />
      </div>
      <section className="specific-book-info" aria-label="Інформація про книгу">
        <h1>{book.title}</h1>
        <p><strong>Автор:</strong> {book.author}</p>
        <p><strong>Рівень:</strong> {book.level || "Не вказано"}</p>
        <p><strong>Теги:</strong> {Array.isArray(book.tags) ? book.tags.join(", ") : book.tags || "Не вказано"}</p>
        <p>{book.shortDescription}</p>
        <p>{book.description}</p>
      </section>
      <section className="purchase-panel" aria-label="Купити книгу">
        <dl>
          <div><dt>Ціна, $</dt><dd>{Number(book.price).toFixed(2)}</dd></div>
          <div>
            <dt><label htmlFor="book-count">Кількість</label></dt>
            <dd>
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label="Зменшити кількість"
                  disabled={count <= 1}
                  onClick={() => adjustCount(-1)}
                >
                  −
                </button>
                <input
                  id="book-count"
                  type="number"
                  min="1"
                  max={book.amount || 42}
                  step="1"
                  value={count}
                  onChange={(event) => changeCount(event.target.value)}
                  onBlur={() => {
                    if (count === "") setCount(1);
                  }}
                />
                <button
                  type="button"
                  aria-label="Збільшити кількість"
                  disabled={count >= (Number(book.amount) || 42)}
                  onClick={() => adjustCount(1)}
                >
                  +
                </button>
              </div>
            </dd>
          </div>
          <div><dt>Разом</dt><dd>${(book.price * (Number(count) || 0)).toFixed(2)}</dd></div>
        </dl>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            addToCart(book, count);
            navigate("/cart");
          }}
        >
          Add to cart
        </button>
        <Link className="text-link" to="/books">Повернутися до каталогу</Link>
      </section>
    </article>
  );
}

export default SpecificBook;
