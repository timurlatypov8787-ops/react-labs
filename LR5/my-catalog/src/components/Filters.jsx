import React from 'react';

export function Filters({ onFilterChange, initialFilters }) {
  const [localCategories, setLocalCategories] = React.useState(initialFilters.categories || []);
  const [localMinPrice, setLocalMinPrice] = React.useState(initialFilters.minPrice !== undefined ? String(initialFilters.minPrice) : '');
  const [localMaxPrice, setLocalMaxPrice] = React.useState(initialFilters.maxPrice !== undefined ? String(initialFilters.maxPrice) : '');

  const [errors, setErrors] = React.useState({});

  // Правильный обработчик для выбора нескольких категорий
  const handleCategoryChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    setLocalCategories(values);
  };

  const validate = () => {
    const errs = {};
    const min = localMinPrice ? Number(localMinPrice) : undefined;
    const max = localMaxPrice ? Number(localMaxPrice) : undefined;

    if (min !== undefined && min < 0) errs.min = 'Цена не может быть отрицательной';
    if (max !== undefined && max < 0) errs.max = 'Цена не может быть отрицательной';
    if (min !== undefined && max !== undefined && min >= 0 && max >= 0 && min > max) {
      errs.min = 'Цена «от» не может быть больше цены «до»';
      errs.max = 'Цена «до» не может быть меньше цены «от»';
    }
    return errs;
  };

  const handleApply = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    onFilterChange({
      categories: localCategories.length > 0 ? localCategories : undefined,
      minPrice: localMinPrice !== '' ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice !== '' ? Number(localMaxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setLocalCategories([]);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setErrors({});
    onFilterChange({
      categories: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const handleMinChange = (e) => {
    setLocalMinPrice(e.target.value);
    setErrors((prev) => ({ ...prev, min: '' }));
  };

  const handleMaxChange = (e) => {
    setLocalMaxPrice(e.target.value);
    setErrors((prev) => ({ ...prev, max: '' }));
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Категории (Ctrl/Cmd + клик)</label>
          <select
            multiple
            value={localCategories}
            onChange={handleCategoryChange}
            style={{ width: '100%', padding: '8px', height: '100px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="electronics">Электроника</option>
            <option value="jewelery">Ювелирные изделия</option>
            <option value="men's clothing">Мужская одежда</option>
            <option value="women's clothing">Женская одежда</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Цена от</label>
          <input
            type="number"
            value={localMinPrice}
            onChange={handleMinChange}
            placeholder="0"
            min="0"
            style={{ width: '100%', padding: '8px', border: errors.min ? '2px solid red' : '1px solid #ccc', borderRadius: '4px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <input 
            type="range" min="0" max="1000" value={localMinPrice || 0} onChange={handleMinChange} style={{ width: '100%' }} 
          />
          {errors.min && <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.min}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Цена до</label>
          <input
            type="number"
            value={localMaxPrice}
            onChange={handleMaxChange}
            placeholder="9999"
            min="0"
            style={{ width: '100%', padding: '8px', border: errors.max ? '2px solid red' : '1px solid #ccc', borderRadius: '4px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <input 
            type="range" min="0" max="1000" value={localMaxPrice || 1000} onChange={handleMaxChange} style={{ width: '100%' }} 
          />
          {errors.max && <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.max}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleApply} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          Применить фильтры
        </button>
        <button onClick={handleReset} style={{ padding: '10px 24px', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          Сбросить
        </button>
      </div>
    </div>
  );
}