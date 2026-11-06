import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookstoreApp from './BookstoreApp';

const book = {
  id: 1,
  title: 'JavaScript: The Definitive Guide',
  author: 'David Flanagan',
  price: 10.99,
  amount: 42,
  image: '',
  level: 'Beginner',
  tags: ['core'],
  shortDescription: 'JavaScript reference.',
  description: 'A guide to JavaScript.',
};
const originalFetch = global.fetch;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ books: [book] }) });
});

afterEach(() => {
  global.fetch = originalFetch;
});

function renderShop(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BookstoreApp />
    </MemoryRouter>
  );
}

async function openBook() {
  renderShop();
  fireEvent.change(screen.getByLabelText('Ім’я користувача'), { target: { value: 'reader' } });
  fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));
  fireEvent.click(await screen.findByRole('img', { name: `Обкладинка книги «${book.title}»` }));
  return screen.findByRole('spinbutton', { name: 'Кількість' });
}

const increase = () => screen.getByRole('button', { name: 'Збільшити кількість' });
const decrease = () => screen.getByRole('button', { name: 'Зменшити кількість' });
const total = () => screen.getByLabelText('Загальна вартість');
const add = () => screen.getByRole('button', { name: 'Додати до кошика' });
const enter = (input, value) => fireEvent.change(input, { target: { value } });

test('increases the quantity by one', async () => {
  const input = await openBook();
  fireEvent.click(increase());
  expect(input).toHaveValue(2);
});

test('decreases the quantity by one', async () => {
  const input = await openBook();
  enter(input, '3');
  fireEvent.click(decrease());
  expect(input).toHaveValue(2);
});

test('updates the total when the quantity changes', async () => {
  await openBook();
  expect(total()).toHaveTextContent('10,99 $');
  fireEvent.click(increase());
  expect(total()).toHaveTextContent('21,98 $');
  fireEvent.click(decrease());
  expect(total()).toHaveTextContent('10,99 $');
});

test('accepts a manually entered integer and updates the total', async () => {
  const input = await openBook();
  enter(input, '7');
  expect(input).toHaveValue(7);
  expect(total()).toHaveTextContent('76,93 $');
});

test('clamps the quantity to 1–42 and disables stepping past either bound', async () => {
  const input = await openBook();
  for (const value of ['0', '-5']) {
    enter(input, value);
    expect(input).toHaveValue(1);
    expect(decrease()).toBeDisabled();
  }
  enter(input, '43');
  expect(input).toHaveValue(42);
  expect(increase()).toBeDisabled();
  expect(total()).toHaveTextContent('461,58 $');
});

test('restores the last valid quantity after blank or fractional input', async () => {
  const input = await openBook();
  enter(input, '4');
  for (const value of ['', '4.5']) {
    enter(input, value);
    expect(add()).toBeDisabled();
    fireEvent.blur(input);
    expect(input).toHaveValue(4);
    expect(add()).toBeEnabled();
  }
});

test('restores the quantity from the cart when a book is reopened', async () => {
  const input = await openBook();
  enter(input, '5');
  fireEvent.click(add());
  fireEvent.click(screen.getByRole('link', { name: /До каталогу/ }));
  fireEvent.click(await screen.findByRole('link', { name: `Переглянути книгу «${book.title}»` }));
  expect(await screen.findByRole('spinbutton', { name: 'Кількість' })).toHaveValue(5);
  expect(total()).toHaveTextContent('54,95 $');
});

test('keeps the cart through a reload and keeps it empty after purchase', async () => {
  const input = await openBook();
  enter(input, '3');
  fireEvent.click(add());
  fireEvent.click(screen.getByRole('link', { name: 'Перейти до кошика' }));
  expect(await screen.findByRole('row', { name: /Definitive Guide.*32,97/ })).toBeInTheDocument();

  cleanup();
  renderShop('/cart');
  expect(await screen.findByRole('row', { name: /Definitive Guide.*32,97/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Придбати' }));
  expect(screen.getByRole('button', { name: 'Придбати' })).toBeDisabled();

  cleanup();
  renderShop('/cart');
  expect(await screen.findByRole('heading', { name: 'Кошик порожній' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Вийти' }));

  cleanup();
  renderShop('/cart');
  expect(await screen.findByRole('textbox', { name: 'Ім’я користувача' })).toBeInTheDocument();
});

test('restores the previous GitHub Pages cart and lets the reader edit and remove its books', async () => {
  const migratedBook = { ...book, id: 3, title: 'JavaScript усюди', price: 8.99 };
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ books: [book, migratedBook] }) });
  localStorage.setItem('x-course-username', 'reader');
  localStorage.setItem('x-course-cart', JSON.stringify([{ id: 1, title: 'JavaScript Everywhere', count: 2 }]));
  renderShop('/cart');

  const input = await screen.findByRole('spinbutton', { name: /Кількість примірників/ });
  expect(input).toHaveValue(2);
  enter(input, '3');
  expect(screen.getByRole('row', { name: /JavaScript усюди.*26,97/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Видалити книгу/ }));
  expect(screen.getByRole('heading', { name: 'Кошик порожній' })).toBeInTheDocument();
  expect(localStorage.getItem('x-course-cart')).toBeNull();
});
