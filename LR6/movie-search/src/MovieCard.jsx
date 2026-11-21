import { useEffect, useState } from 'react';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'ВАШ_КЛЮЧ';
const PLACEHOLDER = 'https://via.placeholder.com/300x450?text=No+Poster';

function MovieCard({ movie }) {
  const [plot, setPlot] = useState('');
  const [plotStatus, setPlotStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // --- доп. задание: описание фильма отдельным запросом ?i=imdbID ---
  useEffect(() => {
    if (!movie?.imdbID) return undefined;

    const controller = new AbortController();

    async function loadPlot() {
      setPlotStatus('loading');
      try {
        const url =
          `https://www.omdbapi.com/?i=${encodeURIComponent(movie.imdbID)}` +
          `&plot=short&apikey=${API_KEY}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Ошибка сети');

        const data = await res.json();
        if (data.Response === 'False') {
          setPlot('Описание недоступно');
        } else {
          setPlot(data.Plot && data.Plot !== 'N/A' ? data.Plot : 'Описание отсутствует');
        }
        setPlotStatus('success');
      } catch (err) {
        if (err.name === 'AbortError') return; // компонент размонтирован — не обновляем state
        setPlot('Не удалось загрузить описание');
        setPlotStatus('error');
      }
    }

    loadPlot();

    return () => controller.abort(); // очистка при размонтировании / смене фильма
  }, [movie.imdbID]);

  // --- обработка отсутствия постера (Шаг 6) ---
  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : PLACEHOLDER;

  return (
    <article className="movie-card">
      <img
        className="movie-card__poster"
        src={posterUrl}
        alt={movie.Title}
        loading="lazy"
        onError={(event) => {
          // подстраховка: если картинка по URL битая — подменяем заглушкой
          if (event.currentTarget.src !== PLACEHOLDER) {
            event.currentTarget.src = PLACEHOLDER;
          }
        }}
      />
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.Title}</h3>
        <p className="movie-card__year">
          <strong>Год:</strong> {movie.Year}
        </p>
        <p className="movie-card__plot">
          {plotStatus === 'loading' ? (
            <span className="movie-card__plot-loading">
              <span className="spinner spinner--small" aria-hidden="true" /> Загрузка описания...
            </span>
          ) : (
            plot
          )}
        </p>
      </div>
    </article>
  );
}

export default MovieCard;