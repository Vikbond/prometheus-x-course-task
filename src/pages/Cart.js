import { useState } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "../context/BooksContext";

function Cart() {
  const { cart: items, updateCartCount, clearCart } = useBooks();
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.count, 0);

  if (items.length === 0) {
    return (
      <section className="empty-cart" aria-label="Кошик порожній">
        <button className="purchase-button" type="button" disabled>Purchase</button>
        <img src={`${process.env.PUBLIC_URL || "."}/assets/cart.svg`} alt="" width="150" height="150" />
        <p>Кошик порожній..</p>
        {purchaseComplete && <p role="status">Дякуємо за покупку!</p>}
        <Link className="text-link" to="/books">Перейти до каталогу</Link>
      </section>
    );
  }

  return (
    <section className="cart-page" aria-labelledby="cart-title">
      <div className="cart-heading">
        <h1 id="cart-title">Кошик</h1>
        <button
          className="button button-primary"
          type="button"
          disabled={items.length === 0}
          onClick={() => {
            clearCart();
            setPurchaseComplete(true);
          }}
        >
          Purchase
        </button>
      </div>
      <div className="cart-table-wrap">
        <table className="cart-table">
          <thead>
            <tr>
              <th scope="col">Назва книги</th>
              <th scope="col">Ціна за одиницю</th>
              <th scope="col">Кількість</th>
              <th scope="col">Загальна ціна</th>
              <th scope="col"><span className="visually-hidden">Видалити</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>
                  <input
                    aria-label={`Кількість: ${item.title}`}
                    type="number"
                    min="1"
                    max={item.amount || 42}
                    value={item.count}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isInteger(next) && next >= 1 && next <= (item.amount || 42)) {
                        updateCartCount(item.id, next);
                      }
                    }}
                  />
                </td>
                <td>${(item.price * item.count).toFixed(2)}</td>
                <td>
                  <button className="remove-button" type="button" onClick={() => updateCartCount(item.id, 0)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cart-total">Загальна сума: ${total.toFixed(2)}</p>
      {purchaseComplete && <p role="status">Дякуємо за покупку!</p>}
      <Link className="text-link" to="/books">Продовжити покупки</Link>
    </section>
  );
}

export default Cart;
