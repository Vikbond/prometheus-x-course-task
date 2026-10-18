const bookGrid = document.querySelector("#book-grid");
const catalogStatus = document.querySelector("#catalog-status");
const searchInput = document.querySelector("#book-search");
const priceSort = document.querySelector("#price-sort");

if (!bookGrid || !catalogStatus || !searchInput || !priceSort) {
  throw new Error("Book catalog elements are missing from the page.");
}

let books = [];

const NOT_FOUND_IMAGE = "assets/imageNotFound.png";

// Remote URLs end with "...@asset+block@<file>.jpg"; the same file is stored locally.
function getLocalImage(url) {
  const fileName = url.split("@").pop();
  return /^[\w.-]+\.(jpe?g|png|svg|webp)$/i.test(fileName) ? `assets/${fileName}` : "";
}

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const cover = document.createElement("img");
  cover.alt = `${book.title} book cover`;
  cover.loading = "lazy";

  const fallbacks = [getLocalImage(book.image), NOT_FOUND_IMAGE].filter(Boolean);
  cover.addEventListener("error", () => {
    const next = fallbacks.shift();
    if (next) {
      cover.src = next;
    }
  });
  cover.src = book.image || fallbacks.shift();

  const title = document.createElement("h2");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "book-author";
  author.textContent = book.author;

  const footer = document.createElement("div");
  footer.className = "book-card-footer";

  const price = document.createElement("p");
  price.className = "book-price";
  price.textContent = `$${book.price.toFixed(2)}`;

  const viewLink = document.createElement("a");
  viewLink.className = "view-button";
  viewLink.href = `../specific-book/index.html?id=${encodeURIComponent(book.id)}`;
  viewLink.textContent = "View";
  viewLink.setAttribute("aria-label", `View ${book.title}`);

  footer.append(price, viewLink);
  card.append(cover, title, author, footer);

  return card;
}

function renderBooks() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const visibleBooks = books.filter((book) =>
    book.title.toLocaleLowerCase().includes(searchTerm),
  );

  if (priceSort.value === "ascending") {
    visibleBooks.sort((first, second) => first.price - second.price);
  } else if (priceSort.value === "descending") {
    visibleBooks.sort((first, second) => second.price - first.price);
  }

  bookGrid.replaceChildren();

  if (visibleBooks.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = searchTerm
      ? "No books match your search."
      : "No books are available.";
    bookGrid.append(emptyState);
    catalogStatus.textContent = "";
    return;
  }

  const cards = document.createDocumentFragment();
  visibleBooks.forEach((book) => cards.append(createBookCard(book)));
  bookGrid.append(cards);
  catalogStatus.textContent = `${visibleBooks.length} ${visibleBooks.length === 1 ? "book" : "books"}`;
}

function isBook(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    Number.isInteger(value.id) &&
    typeof value.author === "string" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.image === "string" &&
    typeof value.title === "string" &&
    typeof value.shortDescription === "string" &&
    typeof value.description === "string"
  );
}

async function loadBooks() {
  try {
    const response = await fetch("books.json");
    if (!response.ok) {
      throw new Error(`Could not load books.json (${response.status}).`);
    }

    const json = await response.json();
    const data = Array.isArray(json) ? json : json?.books;
    if (!Array.isArray(data) || !data.every(isBook)) {
      throw new Error('books.json must contain a "books" array of valid book records.');
    }

    const ids = new Set(data.map((book) => book.id));
    if (ids.size !== data.length) {
      throw new Error("Each book in books.json must have a unique id.");
    }

    books = data;
    renderBooks();
  } catch (error) {
    console.error("Unable to load the book catalog:", error);
    catalogStatus.textContent = "Could not load the book catalog. Check that books.json is available and valid.";
  }
}

searchInput.addEventListener("input", renderBooks);
priceSort.addEventListener("change", renderBooks);

loadBooks();
