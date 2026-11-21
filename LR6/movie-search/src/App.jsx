import { useCallback, useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import './index.css';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY || '2f09e1b2';
const API_URL = 'https://www.omdbapi.com/';

const HISTORY_KEY = 'movie-search-history';
const HISTORY_LIMIT = 5;
const RESULTS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  //состояния 
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);

 
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState('');

  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

 
  const [history, setHistory] = useState(readHistory);

  const saveToHistory = useCallback((value) => {
    setHistory((prev) => {
      const next = [value, ...prev.filter((item) => item !== value)].slice(0, HISTORY_LIMIT);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
       
      }
      return next;
    });
  }, []);

  //запрос к OMDb
  const fetchMovies = useCallback(
    async (searchQuery, pageNumber = 1) => {
      const q = String(searchQuery || '').trim();

      if (!q) {
        setMovies([]);
        setTotalResults(0);
        setStatus('idle');
        setError(null);
        return;
      }

      setStatus('loading');
      setError(null);
      setPage(pageNumber);
      setSearchedQuery(q);

      try {
        const url =
          `${API_URL}?s=${encodeURIComponent(q)}` +
          `&page=${pageNumber}` +
          `&apikey=${API_KEY}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Ошибка сети (HTTP ${res.status})`);

        const data = await res.json();

        
        if (data.Response === 'False' || data.Error) {
          setMovies([]);
          setTotalResults(0);
          setStatus('error');
          setError(data.Error === 'Movie not found!' ? 'Ничего не найдено' : data.Error);
          return;
        }

        setMovies(Array.isArray(data.Search) ? data.Search : []);
        setTotalResults(Number(data.totalResults) || 0);
        setStatus('success');
        saveToHistory(q);
      } catch (err) {
        setMovies([]);
        setTotalResults(0);
        setStatus('error');
        setError(err.message || 'Неизвестная ошибка');
      }
    },
    [saveToHistory]
  );

  //debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.trim();

      if (q.length >= MIN_QUERY_LENGTH) {
        fetchMovies(q, 1);
      } else if (q.length === 0) {
        setMovies([]);
        setTotalResults(0);
        setStatus('idle');
        setError(null);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer); 
  }, [query, fetchMovies]);

  const isLoading = status === 'loading';

  // 
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoading) return; 
    fetchMovies(query, 1);
  };

  const goToPage = (nextPage) => {
    if (isLoading) return;
    fetchMovies(searchedQuery, nextPage);
  };

  
  const yearInRange = (movie) => {
    const match = String(movie.Year || '').match(/\d{4}/);
    if (!match) return true; 
    const year = Number(match[0]);
    if (yearFrom && year < Number(yearFrom)) return false;
    if (yearTo && year > Number(yearTo)) return false;
    return true;
  };

  const visibleMovies = movies.filter(yearInRange);
  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
  const isFiltering = Boolean(yearFrom || yearTo);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Поиск фильмов</h1>
        <p className="app__subtitle">React + OMDb API</p>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-form__input"
          type="text"
          placeholder="Введите название фильма..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="search-form__button" type="submit" disabled={isLoading}>
          {isLoading ? 'Поиск...' : 'Найти'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="history">
          <span className="history__label">История:</span>
          {history.map((item) => (
            <button
              key={item}
              type="button"
              className="history__chip"
              onClick={() => setQuery(item)} 
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {status !== 'idle' && (
        <div className="filters">
          <label className="filters__field">
            Год от:
            <input
              type="number"
              min="1900"
              max="2100"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value)}
            />
          </label>
          <label className="filters__field">
            Год до:
            <input
              type="number"
              min="1900"
              max="2100"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value)}
            />
          </label>
          {isFiltering && (
            <button
              type="button"
              className="filters__reset"
              onClick={() => {
                setYearFrom('');
                setYearTo('');
              }}
            >
              Сбросить
            </button>
          )}
        </div>
      )}

      {/*тображение по состоянию*/}
      {status === 'idle' && <p className="hint">Введите название фильма и нажмите «Найти».</p>}

      {status === 'loading' && (
        <div className="loading">
          <span className="spinner" aria-hidden="true" />
          <p>Загрузка...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          <p>Ошибка: {error}</p>
        </div>
      )}

      {status === 'success' && movies.length === 0 && (
        <p className="hint">Ничего не найдено по вашему запросу.</p>
      )}

      {status === 'success' && movies.length > 0 && (
        <>
          <p className="summary">
            Запрос: «{searchedQuery}» · Найдено: {totalResults} · Страница {page} из {totalPages}
          </p>

          {visibleMovies.length === 0 ? (
            <p className="hint">По выбранному диапазону лет ничего не найдено.</p>
          ) : (
            <div className="movie-list">
              {visibleMovies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => goToPage(page - 1)}
              >
                ← Предыдущая
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || isLoading}
                onClick={() => goToPage(page + 1)}
              >
                Следующая →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;