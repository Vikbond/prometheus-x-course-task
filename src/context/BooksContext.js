import { createContext, useContext, useEffect, useState } from "react";

const BooksContext = createContext(null);
const CART_STORAGE_KEY = "x-course-cart";

function readStoredCart() {
  try {
    const storedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(storedCart) ? storedCart : [];
  } catch (error) {
    console.error("Не вдалося прочитати кошик із локального сховища:", error);
    return [];
  }
}

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [booksStatus, setBooksStatus] = useState("Завантаження каталогу…");
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL || "."}/books.json`);
        if (!response.ok) {
          throw new Error(`Не вдалося завантажити books.json (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("books.json має містити масив книг.");
        }

        if (!cancelled) {
          setBooks(data);
          setBooksStatus("");
        }
      } catch (error) {
        console.error("Помилка завантаження каталогу:", error);
        if (!cancelled) {
          setBooksStatus("Не вдалося завантажити каталог. Перевірте файл books.json.");
        }
      }
    }

    loadBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  function saveCart(nextCart) {
    setCart(nextCart);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    } catch (error) {
      console.error("Не вдалося зберегти кошик у локальному сховищі:", error);
    }
  }

  function addToCart(book, count) {
    const existingItem = cart.find((item) => item.id === book.id);
    const amount = Number(book.amount) || 42;
    const nextCart = existingItem
      ? cart.map((item) =>
          item.id === book.id
            ? { ...item, count: Math.min(amount, item.count + count) }
            : item,
        )
      : [...cart, { ...book, count: Math.min(amount, count) }];

    saveCart(nextCart);
  }

  function updateCartCount(bookId, count) {
    saveCart(
      cart
        .map((item) => (item.id === bookId ? { ...item, count } : item))
        .filter((item) => item.count > 0),
    );
  }

  function clearCart() {
    saveCart([]);
  }

  return (
    <BooksContext.Provider
      value={{
        books,
        booksStatus,
        cart,
        addToCart,
        updateCartCount,
        clearCart,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooks must be used inside a BooksProvider.");
  }
  return context;
}
