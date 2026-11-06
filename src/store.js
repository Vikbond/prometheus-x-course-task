import { createContext, useContext, useEffect, useState } from 'react';

const StoreContext = createContext(null);
const publicUrl = process.env.PUBLIC_URL || '';
const dataUrl = `${publicUrl}/books.json`;
const imageRoot = `${publicUrl}/images`;
const usd = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' });

export function imageUrl(filename) {
  return `${imageRoot}/${encodeURIComponent(filename)}`;
}

export function coverUrl(book) {
  const filename = book.image?.split('@').at(-1);
  return imageUrl(filename || 'imageNotFound-uk.svg');
}

export function priceInCents(book) {
  return Math.round(book.price * 100);
}

export function formatPrice(cents) {
  return usd.format(cents / 100);
}

export function StoreProvider({ active, cart, updateCart, children }) {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();

    async function loadBooks() {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal });
        if (!response.ok) throw new Error('Catalog request failed');
        const data = await response.json();
        if (!Array.isArray(data.books)) throw new Error('Invalid catalog');
        if (controller.signal.aborted) return;
        setBooks(data.books);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }

    loadBooks();
    return () => controller.abort();
  }, [active, request]);

  function retry() {
    setStatus('loading');
    setRequest((previous) => previous + 1);
  }

  function setQuantity(book, quantity) {
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= (book.amount ?? 42)) {
      updateCart((previous) => ({ ...previous, [book.id]: quantity }));
    }
  }

  function purchase() {
    updateCart(() => ({}));
  }

  function removeBook(id) {
    updateCart((previous) => {
      const remaining = { ...previous };
      delete remaining[id];
      return remaining;
    });
  }

  return (
    <StoreContext.Provider value={{ books, status, retry, cart, setQuantity, removeBook, purchase }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
