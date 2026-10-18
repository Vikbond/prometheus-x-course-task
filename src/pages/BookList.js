import { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BooksContext";

function BookList() {
  const { books, booksStatus } = useBooks();
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("all");

  const filteredBooks = books.filter((book) => {
    const matchesTitle = book.title
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase());
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under-15" && book.price > 0 && book.price < 15) ||
      (priceRange === "15-to-30" && book.price > 15 && book.price < 30) ||
      (priceRange === "over-30" && book.price > 30);
    return matchesTitle && matchesPrice;
  });

  function truncateTitle(title) {
    return title.length > 24 ? `${title.slice(0, 24)}...` : title;
  }

  return (
    <section className="catalog-page" aria-labelledby="catalog-title">
      <h1 id="catalog-title" className="visually-hidden">Список книг</h1>
      <div className="catalog-controls">
        <label className="search-field">
          <span className="visually-hidden">Пошук за назвою книги</span>
          <input
            type="search"
            placeholder="Пошук за назвою книги"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="sort-field">
          <span className="visually-hidden">Фільтрувати за ціною</span>
          <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
            <option value="all">Всі ціни</option>
            <option value="under-15">0 &lt; ціна &lt; 15</option>
            <option value="15-to-30">15 &lt; ціна &lt; 30</option>
            <option value="over-30">ціна &gt; 30</option>
          </select>
        </label>
      </div>
      {booksStatus && <p className="catalog-status" role="status">{booksStatus}</p>}
      {!booksStatus && filteredBooks.length === 0 && (
        <p className="empty-state">Книг за цим запитом не знайдено.</p>
      )}
      <div className="book-grid">
        {filteredBooks.map((book) => (
          <article className="book-card" key={book.id}>
            <img
              className="book-card-cover"
              src={`${process.env.PUBLIC_URL || "."}/assets/${book.image}`}
              alt={`Обкладинка книги «${book.title}»`}
              onError={(event) => {
                if (!event.currentTarget.src.endsWith("/imageNotFound.png")) {
                  event.currentTarget.src = `${process.env.PUBLIC_URL || "."}/assets/imageNotFound.png`;
                }
              }}
            />
            <h2>{truncateTitle(book.title)}</h2>
            <p className="book-author">{book.author}</p>
            <p className="book-short-description">{book.shortDescription}</p>
            <div className="book-card-footer">
              <p className="book-price">${Number(book.price).toFixed(2)}</p>
              <Link className="button button-secondary" to={`/books/${book.id}`}>
                View
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BookList;
