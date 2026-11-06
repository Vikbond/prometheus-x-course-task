import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import BookstoreApp from './BookstoreApp';

const routerOptions = { v7_startTransition: true, v7_relativeSplatPath: true };
const originalFetch = global.fetch;

beforeEach(() => {
  sessionStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ books: [] }) });
});

afterEach(() => {
  global.fetch = originalFetch;
});

test.each(['/boocs', '/books/999'])('shows 404 to a signed-in reader at %s', async (path) => {
  render(
    <MemoryRouter initialEntries={[path]} future={routerOptions}>
      <Link to={path}>Відкрити тестовий маршрут</Link>
      <BookstoreApp />
    </MemoryRouter>
  );

  const username = await screen.findByRole('textbox', { name: 'Ім’я користувача' });
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.change(username, { target: { value: 'reader' } });
  fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));
  await screen.findByRole('heading', { name: 'Каталог книг' });
  fireEvent.click(screen.getByRole('link', { name: 'Відкрити тестовий маршрут' }));

  expect(await screen.findByRole('heading', { name: 'Сторінку не знайдено' })).toBeInTheDocument();
  expect(screen.getByText('Помилка 404')).toBeInTheDocument();
});
