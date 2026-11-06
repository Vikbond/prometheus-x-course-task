import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { coverUrl, formatPrice, imageUrl, priceInCents, useStore } from './store';

const priceFilters = [
  { value: 'all', label: 'Всі', matches: () => true },
  { value: 'low', label: '0 < ціна < 15', matches: (price) => price > 0 && price < 1500 },
  { value: 'middle', label: '15 < ціна < 30', matches: (price) => price > 1500 && price < 3000 },
  { value: 'high', label: 'ціна > 30', matches: (price) => price > 3000 },
];

function Cover({ book, className, lazy }) {
  const fallback = imageUrl('imageNotFound-uk.svg');
  return (
    <img
      className={className}
      src={coverUrl(book)}
      alt={`Обкладинка книги «${book.title}»`}
      loading={lazy ? 'lazy' : undefined}
      onError={(event) => {
        const image = event.currentTarget;
        if (image.getAttribute('src') !== fallback) image.src = fallback;
      }}
    />
  );
}

function LoadingState() {
  const { status, retry } = useStore();
  if (status === 'loading') return <p className="notice" role="status">Завантаження книг…</p>;
  return (
    <div className="notice">
      <p role="alert">Не вдалося завантажити каталог.</p>
      <button className="button" type="button" onClick={retry}>Спробувати ще раз</button>
    </div>
  );
}

export function Catalog() {
  const { books, status } = useStore();
  const [query, setQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const matchesPrice = priceFilters.find(({ value }) => value === priceFilter).matches;
  const searchTerm = query.trim().toLocaleLowerCase('uk');
  const visibleBooks = books.filter((book) => {
    const titles = [book.title, book.originalTitle ?? book.title];
    return matchesPrice(priceInCents(book)) &&
      titles.some((title) => title.toLocaleLowerCase('uk').includes(searchTerm));
  });

  return (
    <div className="page">
      <div className="page-intro">
        <p className="eyebrow">Книжковий інтернет-магазин</p>
        <h1>Каталог книг</h1>
      </div>
      <div className="filters">
        <label className="filter">
          Пошук за назвою
          <input className="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Введіть назву книги" />
        </label>
        <label className="filter">
          Ціна, $
          <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
            {priceFilters.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      {status !== 'ready' ? <LoadingState /> : (
        <>
          <p className="result-count" role="status">Знайдено книг: {visibleBooks.length}</p>
          {visibleBooks.length === 0 ? <p className="notice">За цими фільтрами книг немає.</p> : (
            <section className="catalog-grid" aria-label="Книги">
              {visibleBooks.map((book) => {
                const characters = Array.from(book.title);
                const title = characters.length > 24 ? `${characters.slice(0, 24).join('')}...` : book.title;
                return (
                  <article className="card" key={book.id}>
                    <Link className="card-link" to={`/books/${book.id}`} aria-label={`Переглянути книгу «${book.title}»`}>
                      <Cover book={book} className="card-cover" lazy />
                      <h2 title={book.title}>{title}</h2>
                      <p className="card-author">{book.author}</p>
                      <div className="card-actions">
                        <strong>{formatPrice(priceInCents(book))}</strong>
                        <span className="button button-outline">Переглянути</span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function BookPage() {
  const { id } = useParams();
  const { books, status, cart } = useStore();
  if (status !== 'ready') return <div className="page"><LoadingState /></div>;
  const book = books.find((entry) => String(entry.id) === id);
  if (!book) return <NotFound />;

  return (
    <article className="page">
      <Link className="back-link" to="/books">← До каталогу</Link>
      <div className="book-overview">
        <Cover book={book} className="detail-cover" />
        <div>
          <p className="eyebrow">Про книгу</p>
          <h1>{book.title}</h1>
          <p className="book-author">{book.author}</p>
          <p><strong>Рівень:</strong> {book.level}</p>
          <ul className="tags" aria-label="Теги">
            {book.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
          <p className="book-summary">{book.shortDescription}</p>
        </div>
        <BookOrder key={book.id} book={book} initialQuantity={cart[book.id] ?? 1} />
      </div>
      <section className="description" aria-labelledby="description-heading">
        <h2 id="description-heading">Опис книги</h2>
        <p>{book.description}</p>
      </section>
    </article>
  );
}

function BookOrder({ book, initialQuantity }) {
  const { cart, setQuantity } = useStore();
  const [quantity, updateQuantity] = useState(initialQuantity);
  const [draft, setDraft] = useState(String(initialQuantity));
  const [saved, setSaved] = useState(false);
  const maximum = book.amount ?? 42;
  const price = priceInCents(book);

  function commit(value) {
    const next = Math.max(1, Math.min(maximum, value));
    updateQuantity(next);
    setDraft(String(next));
    setSaved(false);
  }

  function changeQuantity(event) {
    const { value, valueAsNumber } = event.currentTarget;
    if (Number.isInteger(valueAsNumber)) {
      commit(valueAsNumber);
    } else {
      setDraft(value);
      setSaved(false);
    }
  }

  function addToCart(event) {
    event.preventDefault();
    if (!draft || !Number.isInteger(Number(draft))) return;
    setQuantity(book, quantity);
    setSaved(true);
  }

  return (
    <form className="order" onSubmit={addToCart}>
      <p className="eyebrow">Замовлення</p>
      <div className="order-row"><strong>Ціна</strong><span>{formatPrice(price)}</span></div>
      <div className="order-row">
        <label htmlFor="count"><strong>Кількість</strong></label>
        <div className="stepper">
          <button type="button" aria-label="Зменшити кількість" onClick={() => commit(quantity - 1)} disabled={quantity === 1}>−</button>
          <input id="count" type="number" min="1" max={maximum} step="1" required value={draft} onChange={changeQuantity} onBlur={() => setDraft(String(quantity))} />
          <button type="button" aria-label="Збільшити кількість" onClick={() => commit(quantity + 1)} disabled={quantity === maximum}>+</button>
        </div>
      </div>
      <div className="order-row order-total">
        <strong>Загальна вартість</strong>
        <output htmlFor="count" aria-label="Загальна вартість">{formatPrice(price * quantity)}</output>
      </div>
      <button className="button add-button" type="submit" disabled={!draft || !Number.isInteger(Number(draft))}>Додати до кошика</button>
      <p className="order-status" role="status">{saved ? `Збережено в кошику: ${quantity}.` : cart[book.id] ? `У кошику: ${cart[book.id]}.` : ''}</p>
      {cart[book.id] > 0 && <Link className="order-cart-link" to="/cart">Перейти до кошика</Link>}
    </form>
  );
}

export function Cart() {
  const { books, cart, setQuantity, removeBook, purchase, status } = useStore();
  const [purchased, setPurchased] = useState(false);
  const lines = books.filter((book) => cart[book.id]);
  const total = lines.reduce((sum, book) => sum + priceInCents(book) * cart[book.id], 0);

  function completePurchase() {
    purchase();
    setPurchased(true);
  }

  return (
    <div className="page">
      <div className="cart-heading">
        <h1>Кошик</h1>
        <button className="button" type="button" onClick={completePurchase} disabled={lines.length === 0}>Придбати</button>
      </div>
      {status !== 'ready' ? <LoadingState /> : lines.length === 0 ? (
        <div className="empty-cart">
          <img src={imageUrl('cart.svg')} alt="" width="96" height="96" />
          <h2>Кошик порожній</h2>
          {purchased && <p role="status">Покупку завершено.</p>}
          <Link to="/books">До каталогу</Link>
        </div>
      ) : (
        <>
          <table className="cart-table" aria-label="Книги в кошику">
            <thead><tr><th scope="col">Книга</th><th scope="col">Кількість</th><th scope="col">Ціна за примірник</th><th scope="col">Сума</th></tr></thead>
            <tbody>
              {lines.map((book) => (
                <tr key={book.id}>
                  <th scope="row">
                    <Link to={`/books/${book.id}`}>{book.title}</Link>
                    <button className="remove-book" type="button" aria-label={`Видалити книгу «${book.title}»`} onClick={() => removeBook(book.id)}>Видалити</button>
                  </th>
                  <td>
                    <input className="cart-quantity" type="number" min="1" max={book.amount ?? 42} step="1" value={cart[book.id]} aria-label={`Кількість примірників книги «${book.title}»`} onChange={(event) => setQuantity(book, event.currentTarget.valueAsNumber)} />
                  </td>
                  <td>{formatPrice(priceInCents(book))}</td>
                  <td>{formatPrice(priceInCents(book) * cart[book.id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cart-total">Загальна сума <strong>{formatPrice(total)}</strong></p>
          <Link to="/books">Продовжити покупки</Link>
        </>
      )}
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page not-found">
      <p className="eyebrow">Помилка 404</p>
      <h1>Сторінку не знайдено</h1>
      <Link className="button" to="/books">До каталогу</Link>
    </div>
  );
}
