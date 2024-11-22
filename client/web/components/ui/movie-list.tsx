import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';
import { useConnection } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { MovieCoordinator } from '@/coordinator/MovieCoordinator';

export const MovieList: FC = () => {
  const { connection } = useConnection();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        const movies = await MovieCoordinator.fetchPage(
          connection,
          page,
          10,
          search,
          search !== ''
        );
        setMovies(movies);
      } catch (error: any) {
        console.error('Fetch movies error', error);
        toast.error(error.message);
      }
    })();
  }, [setMovies, connection, page, search]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      <input
        id="search"
        className="w-[300px] p-2 mb-4 bg-gray-700 border border-gray-600 rounded text-gray-400"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      {movies.map((movie, i) => (
        <Card key={i} movie={movie} />
      ))}
      <div className="flex justify-between mt-4">
        {page > 0 && (
          <button
            onClick={() => setPage((page) => page - 1)}
            className="px-6 py-2 bg-gray-300 text-black font-semibold rounded"
          >
            Previous
          </button>
        )}
        {movies.length % 10 === 0 && (
          <button
            onClick={() => setPage((page) => page + 1)}
            className="px-6 py-2 bg-gray-300 text-black font-semibold rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
