import { formatPrice, loadBooks, setCover } from "../standalone-books.js";

const catalog = document.querySelector("#catalog");
const template = document.querySelector("#book-card");
const status = document.querySelector("#status");

try {
  const books = await loadBooks();
  for (const book of books) {
    const card = template.content.cloneNode(true);
    setCover(card.querySelector("img"), book);
    card.querySelector("h2").textContent = book.title;
    card.querySelector("p").textContent = book.author;
    card.querySelector("strong").textContent = formatPrice(Math.round(book.price * 100));
    const link = card.querySelector("a");
    link.href = `../specific-book/?id=${book.id}`;
    link.setAttribute("aria-label", `Переглянути книгу «${book.title}»`);
    catalog.append(card);
  }
  status.hidden = books.length > 0;
  status.textContent = "Каталог порожній.";
} catch {
  status.textContent = "Не вдалося завантажити каталог. Оновіть сторінку.";
}
