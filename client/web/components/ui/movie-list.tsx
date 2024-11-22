import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { MovieCoordinator } from '@/coordinator/MovieCoordinator';

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

// 4 bytes are used to store the current length of a string
const STRING_LENGTH_SPACE = 4;

// 9 bytes are reserved for some metadata related to the account structure. (initialized 1(bool) + rating 8(u8))
const ACCOUNT_METADATA_SPACE = 1;

// The offset where the actual data begins.
const DATA_OFFSET = STRING_LENGTH_SPACE + ACCOUNT_METADATA_SPACE;

// Length of data we need to retrieve (15 bytes in this case, based on the expected size of the relevant data slice).
const DATA_LENGTH = 100;

export const MovieList: FC = () => {
  const { connection } = useConnection();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        const movies = await MovieCoordinator.fetchPage(connection, page, 10);
        setMovies(movies);
      } catch (error: any) {
        console.error('Fetch movies error', error);
      }
    })();
  }, [setMovies, connection, page]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
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
