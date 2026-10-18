const booksList = document.querySelector("#books_list_wrapper");
const catalogStatus = document.querySelector("#catalog-status");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search_book");
const priceFilter = document.querySelector("#price-filter");

const NOT_FOUND_IMAGE = "assets/imageNotFound.png";
const LOCAL_IMAGES_DIR = "assets/";
const BOOKS_URL = "books.json";

let books = [];

// Remote URLs end with "...@asset+block@<file>.jpg"; the same file is stored locally.
function getLocalImage(url) {
  const fileName = url.split("@").pop();
  return /^[\w.-]+\.(jpe?g|png|svg|webp)$/i.test(fileName)
    ? `${LOCAL_IMAGES_DIR}${fileName}`
    : "";
}

function createBookCard(book) {
  const column = document.createElement("div");
  column.className = "col";

  const card = document.createElement("div");
  card.className = "card";

  const bookUrl = `../specific-book/index.html?id=${encodeURIComponent(book.id)}`;

  const pictureLink = document.createElement("a");
  pictureLink.className = "card__picture-block";
  pictureLink.href = bookUrl;
  pictureLink.tabIndex = -1;

  const cover = document.createElement("img");
  cover.className = "card__picture-block-img";
  cover.alt = book.title;
  cover.loading = "lazy";

  const fallbacks = [getLocalImage(book.image), NOT_FOUND_IMAGE].filter(Boolean);
  cover.addEventListener("error", () => {
    const next = fallbacks.shift();
    if (next) {
      cover.src = next;
    }
  });
  cover.src = book.image || fallbacks.shift();
  pictureLink.append(cover);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h5");
  title.className = "card-title";
  title.textContent = book.title;
  title.title = book.title;

  const author = document.createElement("p");
  author.className = "card-text";
  author.textContent = book.author;

  const footer = document.createElement("div");
  footer.className = "card-footer-row";

  const price = document.createElement("span");
  price.className = "book-price";
  price.textContent = `$${book.price.toFixed(2)}`;

  const viewLink = document.createElement("a");
  viewLink.className = "btn btn-outline-primary";
  viewLink.href = bookUrl;
  viewLink.textContent = "View";
  viewLink.setAttribute("aria-label", `View ${book.title}`);

  footer.append(price, viewLink);
  body.append(title, author, footer);
  card.append(pictureLink, body);
  column.append(card);

  return column;
}

function matchesPrice(book) {
  const [min, max] = priceFilter.value.split("-");
  return book.price >= Number(min) && (max === "" || book.price < Number(max));
}

function renderBooks() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const visibleBooks = books.filter(
    (book) =>
      book.title.toLocaleLowerCase().includes(searchTerm) && matchesPrice(book),
  );

  booksList.replaceChildren(...visibleBooks.map(createBookCard));
  catalogStatus.textContent = visibleBooks.length === 0 ? "No books found." : "";
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
    const response = await fetch(BOOKS_URL);
    if (!response.ok) {
      throw new Error(`Could not load books.json (${response.status}).`);
    }

    const json = await response.json();
    const data = Array.isArray(json) ? json : json?.books;
    if (!Array.isArray(data) || !data.every(isBook)) {
      throw new Error('books.json must contain a "books" array of valid book records.');
    }

    books = data;
    renderBooks();
  } catch (error) {
    console.error("Unable to load the book catalog:", error);
    catalogStatus.textContent =
      "Could not load the book catalog. Check that books.json is available and valid.";
  }
}

searchInput.addEventListener("input", renderBooks);
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderBooks();
});
priceFilter.addEventListener("change", renderBooks);

loadBooks();
