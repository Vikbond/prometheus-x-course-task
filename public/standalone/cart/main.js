import { formatPrice, loadBooks, loadCart, saveCart } from "../standalone-books.js";

const purchase = document.querySelector("#purchase");
const status = document.querySelector("#status");
const empty = document.querySelector("#empty");
const table = document.querySelector("#lines");
const body = table.tBodies[0];
const summary = document.querySelector("#summary");
const total = document.querySelector("#total");

function render(books, cart) {
  body.replaceChildren();
  let sum = 0;

  for (const book of books) {
    const quantity = cart[book.id];
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > (book.amount ?? 42)) continue;
    const unitPrice = Math.round(book.price * 100);
    const lineTotal = unitPrice * quantity;
    sum += lineTotal;

    const row = body.insertRow();
    const link = document.createElement("a");
    link.href = `../specific-book/?id=${book.id}`;
    link.textContent = book.title;
    row.insertCell().append(link);
    row.insertCell().textContent = quantity;
    row.insertCell().textContent = formatPrice(unitPrice);
    row.insertCell().textContent = formatPrice(lineTotal);
  }

  const isEmpty = body.rows.length === 0;
  purchase.disabled = isEmpty;
  empty.hidden = !isEmpty;
  table.hidden = isEmpty;
  summary.hidden = isEmpty;
  total.textContent = formatPrice(sum);
}

try {
  const books = await loadBooks();
  render(books, loadCart());
  status.textContent = "";
  purchase.addEventListener("click", () => {
    try {
      saveCart({});
      render(books, {});
      status.textContent = "Покупку завершено.";
    } catch {
      status.textContent = "Не вдалося очистити кошик у браузері.";
    }
  });
} catch {
  status.textContent = "Не вдалося завантажити кошик. Оновіть сторінку.";
}
