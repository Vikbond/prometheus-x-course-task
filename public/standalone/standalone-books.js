const usd = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' });

export async function loadBooks() {
  const response = await fetch("../books.json");
  if (!response.ok) throw new Error("Не вдалося завантажити каталог.");
  const { books } = await response.json();
  return books;
}

export function setCover(image, book) {
  const fallback = "../imageNotFound-uk.svg";
  const filename = book.image?.split("@").at(-1);
  image.addEventListener("error", () => { image.src = fallback; }, { once: true });
  image.src = filename ? `../${encodeURIComponent(filename)}` : fallback;
}

export function formatPrice(cents) {
  return usd.format(cents / 100);
}

const cartKey = "x-course-task.html-cart";

export function loadCart() {
  try {
    return JSON.parse(sessionStorage.getItem(cartKey)) ?? {};
  } catch {
    return {};
  }
}

export function saveCart(cart) {
  sessionStorage.setItem(cartKey, JSON.stringify(cart));
}
