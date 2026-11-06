import { formatPrice, loadBooks, loadCart, saveCart, setCover } from "../standalone-books.js";

const byId = (id) => document.getElementById(id);
const input = byId("count");
const minus = byId("minus");
const plus = byId("plus");
const add = byId("add");
let maximum = 42;
let unitPrice = 1099;
let quantity = 1;
let currentBook;

function update(commit = false) {
  const value = input.valueAsNumber;
  if (Number.isInteger(value)) {
    quantity = Math.max(1, Math.min(maximum, value));
    input.value = quantity;
  } else if (commit) {
    input.value = quantity;
  }
  minus.disabled = quantity === 1;
  plus.disabled = quantity === maximum;
  add.disabled = !currentBook || !Number.isInteger(input.valueAsNumber);
  byId("total").textContent = formatPrice(unitPrice * quantity);
}

function step(delta) {
  input.value = quantity + delta;
  update();
}

input.addEventListener("input", () => update());
input.addEventListener("blur", () => update(true));
minus.addEventListener("click", () => step(-1));
plus.addEventListener("click", () => step(1));
byId("order").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentBook || add.disabled) return;
  try {
    saveCart({ ...loadCart(), [currentBook.id]: quantity });
    byId("added").textContent = `Збережено в кошику: ${quantity}.`;
    byId("open-cart").hidden = false;
  } catch {
    byId("added").textContent = "Не вдалося зберегти кошик у браузері.";
  }
});

try {
  const books = await loadBooks();
  const id = new URLSearchParams(location.search).get("id") ?? "1";
  const book = books.find((entry) => String(entry.id) === id);
  if (!book) {
    byId("book").hidden = true;
    byId("status").hidden = false;
    byId("status").textContent = "404 — книгу не знайдено.";
  } else {
    setCover(byId("cover"), book);
    byId("title").textContent = book.title;
    byId("author").textContent = book.author;
    byId("level").textContent = book.level;
    byId("tags").textContent = book.tags.join(", ");
    byId("summary").textContent = book.shortDescription;
    byId("description").textContent = book.description;
    unitPrice = Math.round(book.price * 100);
    maximum = book.amount ?? 42;
    currentBook = book;
    input.max = maximum;
    const savedQuantity = loadCart()[book.id];
    if (Number.isInteger(savedQuantity) && savedQuantity >= 1 && savedQuantity <= maximum) {
      input.value = savedQuantity;
      byId("open-cart").hidden = false;
      byId("added").textContent = `У кошику: ${savedQuantity}.`;
    }
    byId("price").textContent = formatPrice(unitPrice);
    update(true);
  }
} catch {
  byId("book").hidden = true;
  byId("status").hidden = false;
  byId("status").textContent = "Не вдалося завантажити книгу. Оновіть сторінку.";
}
