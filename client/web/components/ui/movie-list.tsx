import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export const MovieList: FC = () => {
  const { connection } = useConnection();
  const [movies, setMovies] = useState<Movie[]>([]); // Specify the type here

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        const accounts = await connection.getProgramAccounts(
          new PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        );
        console.log('LENGTH', accounts.length);

        const movies = accounts
          .slice(0, 30)
          .map(({ account }) => Movie.deserialize(account.data))
          .filter((movie) => movie !== null);

        setMovies(movies);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message);
      }
    })();
  }, [setMovies, connection]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      {movies.map((movie, i) => (
        <Card key={i} movie={movie} />
      ))}
    </div>
  );
};
