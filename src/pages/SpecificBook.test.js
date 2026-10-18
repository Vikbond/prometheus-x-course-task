import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SpecificBook from "./SpecificBook";

jest.mock("../context/BooksContext", () => ({
  useBooks: jest.fn(),
}));

const { useBooks } = jest.requireMock("../context/BooksContext");

const testBook = {
  id: 1,
  author: "Test Author",
  price: 52.72,
  amount: 42,
  image: "test-book.jpg",
  title: "Test Book",
  shortDescription: "A test book.",
  description: "A book used to test quantity and price behavior.",
};

function renderBookPage(cart = []) {
  useBooks.mockReturnValue({
    books: [testBook],
    booksStatus: "",
    cart,
    addToCart: jest.fn(),
  });

  return render(
    <MemoryRouter initialEntries={["/books/1"]}>
      <Routes>
        <Route path="/books/:id" element={<SpecificBook />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SpecificBook quantity and total price", () => {
  beforeEach(() => {
    useBooks.mockReset();
  });

  test("increases quantity when the increase button is clicked", async () => {
    const user = userEvent.setup();
    renderBookPage();

    const quantityInput = screen.getByRole("spinbutton", { name: "Кількість" });
    await user.click(screen.getByRole("button", { name: "Збільшити кількість" }));

    expect(quantityInput).toHaveValue(2);
  });

  test("decreases quantity when the decrease button is clicked", async () => {
    const user = userEvent.setup();
    renderBookPage([{ ...testBook, count: 2 }]);

    const quantityInput = screen.getByRole("spinbutton", { name: "Кількість" });
    expect(quantityInput).toHaveValue(2);

    await user.click(screen.getByRole("button", { name: "Зменшити кількість" }));

    expect(quantityInput).toHaveValue(1);
  });

  test("updates the total price when quantity is entered manually", async () => {
    const user = userEvent.setup();
    renderBookPage();

    const quantityInput = screen.getByRole("spinbutton", { name: "Кількість" });
    await user.clear(quantityInput);
    await user.type(quantityInput, "3");

    expect(quantityInput).toHaveValue(3);
    expect(screen.getByText("$158.16")).toBeInTheDocument();
  });

  test("updates the total price when using the increase and decrease controls", () => {
    renderBookPage();

    const increaseButton = screen.getByRole("button", { name: "Збільшити кількість" });
    const decreaseButton = screen.getByRole("button", { name: "Зменшити кількість" });

    fireEvent.click(increaseButton);
    expect(screen.getByText("$105.44")).toBeInTheDocument();

    fireEvent.click(decreaseButton);
    expect(screen.getByText("$52.72")).toBeInTheDocument();
  });
});
