import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 15 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];

const VAT_RATE = 0.22;

export default function DiscountCalculator() {
  const [items, setItems] = useState([
    { id: Date.now(), price: "", category: "electronics", useCustom: false, customDiscount: 0 }
  ]);
  const [promoCode, setPromoCode] = useState("");
  const [hasVAT, setHasVAT] = useState(true);
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), price: "", category: "electronics", useCustom: false, customDiscount: 0 }]);
    setCalculated(false);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
    setCalculated(false);
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setError("");
    setCalculated(false);
  };

  const handlePriceChange = (id, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleItemChange(id, "price", value);
    }
  };

  const calculateResults = () => {
    let totalBase = 0;
    let totalDiscount = 0;
    let totalAfterCategory = 0;

    for (const item of items) {
      if (!item.price.trim()) {
        setError("Заполните цену для всех товаров");
        setCalculated(false);
        return null;
      }
      const numPrice = parseFloat(item.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        setError("Цена должна быть положительным числом");
        setCalculated(false);
        return null;
      }

      const categoryObj = CATEGORIES.find((c) => c.id === item.category);
      const catDiscount = categoryObj ? categoryObj.discount : 0;
      const appliedDiscount = item.useCustom ? item.customDiscount : catDiscount;

      const discountAmount = numPrice * (appliedDiscount / 100);
      const priceAfter = numPrice - discountAmount;

      totalBase += numPrice;
      totalDiscount += discountAmount;
      totalAfterCategory += priceAfter;
    }

    let promoDiscountAmount = 0;
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      promoDiscountAmount = totalAfterCategory * 0.1;
    }

    const subtotal = totalAfterCategory - promoDiscountAmount;
    const vatAmount = hasVAT ? subtotal * VAT_RATE : 0;
    const total = subtotal + vatAmount;

    return { totalBase, totalDiscount, totalAfterCategory, promoDiscountAmount, subtotal, vatAmount, total };
  };

  const results = calculated ? calculateResults() : null;

  const handleCalculate = () => {
    const res = calculateResults();
    if (res) {
      setError("");
      setCalculated(true);
      setHistory((prev) => [
        { id: Date.now(), date: new Date().toLocaleTimeString(), total: res.total, itemsCount: items.length },
        ...prev,
      ].slice(0, 5));
    }
  };

  const handleReset = () => {
    setItems([{ id: Date.now(), price: "", category: "electronics", useCustom: false, customDiscount: 0 }]);
    setPromoCode("");
    setHasVAT(true);
    setCalculated(false);
    setError("");
  };

  const formatRub = (value) => {
    return value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₽";
  };

  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id} className="item-row">
            <div className="item-header">
              <h3>Товар {index + 1}</h3>
              {items.length > 1 && (
                <button className="btn-remove" onClick={() => handleRemoveItem(item.id)}>Удалить</button>
              )}
            </div>

            <div className="field">
              <label className="field__label">Цена (₽)</label>
              <input
                type="text"
                className="field__input"
                value={item.price}
                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                placeholder="Например: 1000"
                inputMode="decimal"
              />
            </div>

            <div className="field">
              <label className="field__label">Категория</label>
              <select
                className="field__input field__select"
                value={item.category}
                onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
                disabled={item.useCustom}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} — скидка {cat.discount}%
                  </option>
                ))}
              </select>
            </div>

            <div className="custom-discount-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={item.useCustom}
                  onChange={(e) => handleItemChange(item.id, "useCustom", e.target.checked)}
                />
                Своя скидка ({item.customDiscount}%)
              </label>
              {item.useCustom && (
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={item.customDiscount}
                  onChange={(e) => handleItemChange(item.id, "customDiscount", Number(e.target.value))}
                  className="range-input"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn--outline" onClick={handleAddItem}>
        + Добавить товар
      </button>

      <div className="global-settings">
        <div className="field">
          <label className="field__label">Промокод (WELCOME10)</label>
          <input
            type="text"
            className="field__input"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value); setCalculated(false); }}
            placeholder="Введите промокод"
          />
        </div>
        <div className="field checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasVAT}
              onChange={(e) => { setHasVAT(e.target.checked); setCalculated(false); }}
            />
            Начислить НДС (22%)
          </label>
        </div>
      </div>

      {error && <span className="field__error" style={{ marginBottom: '15px', display: 'block' }}>{error}</span>}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleCalculate}>
          Рассчитать
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Сбросить
        </button>
      </div>

      {calculated && results && (
        <div className="results">
          <h3 className="results__title">Результаты расчёта:</h3>
          <table className="results__table">
            <tbody>
              <tr>
                <td>Общая стоимость без скидок</td>
                <td className="results__value">{formatRub(results.totalBase)}</td>
              </tr>
              <tr>
                <td>Скидка по категориям / ручная</td>
                <td className="results__value results__value--discount">-{formatRub(results.totalDiscount)}</td>
              </tr>
              <tr>
                <td>Цена после скидки</td>
                <td className="results__value">{formatRub(results.totalAfterCategory)}</td>
              </tr>
              {results.promoDiscountAmount > 0 && (
                <tr>
                  <td>Промокод WELCOME10 (10%)</td>
                  <td className="results__value results__value--discount">-{formatRub(results.promoDiscountAmount)}</td>
                </tr>
              )}
              <tr>
                <td>Подытог</td>
                <td className="results__value">{formatRub(results.subtotal)}</td>
              </tr>
              <tr>
                <td>НДС (22%)</td>
                <td className="results__value">{formatRub(results.vatAmount)}</td>
              </tr>
              <tr className="results__row--total">
                <td>Итого к оплате</td>
                <td className="results__value">{formatRub(results.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3 className="results__title">История (последние 5):</h3>
          <ul className="history__list">
            {history.map((h) => (
              <li key={h.id} className="history__item">
                <span>{h.date}</span>
                <span>{h.itemsCount} тов.</span>
                <strong>{formatRub(h.total)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}