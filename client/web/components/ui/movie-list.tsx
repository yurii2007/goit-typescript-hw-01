import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

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
  const [movies, setMovies] = useState<Movie[]>([]); // Specify the type here

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        // const accounts = await connection.getProgramAccounts(
        //   new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
        //   // { dataSlice: { length: 10, offset: 1 } }
        // );
        const accountsWithData = await connection.getProgramAccounts(
          new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
          // INITIALIZED field(1 for bool) + RATING field(8 for u8) + 4 for the storing string size; Length is 40 because of expected length is 40
          { dataSlice: { offset: DATA_OFFSET, length: DATA_LENGTH } }
        );

        const accounts = Array.from(accountsWithData.slice(0, 20));
        accounts.sort((a, b) => {
          try {
            // Check if buffers are long enough to avoid out-of-bounds access
            const lengthA = a.account.data.readUInt32LE(0);
            const lengthB = b.account.data.readUInt32LE(0);

            if (
              a.account.data.length < STRING_LENGTH_SPACE + lengthA ||
              b.account.data.length < STRING_LENGTH_SPACE + lengthB
            ) {
              throw new Error('Buffer length is insufficient');
            }

            const dataA = a.account.data.subarray(
              STRING_LENGTH_SPACE,
              STRING_LENGTH_SPACE + lengthA
            );
            const dataB = b.account.data.subarray(
              STRING_LENGTH_SPACE,
              STRING_LENGTH_SPACE + lengthB
            );
            console.log(dataA.compare(dataB));

            return dataB.compare(dataA);
          } catch (error) {
            console.error('Error sorting accounts: ', error);
            return 0; // Default sort order in case of error
          }
        });

        const accountKeys = accounts.map(({ pubkey }) => pubkey);

        const accountInfos = await connection.getMultipleAccountsInfo(
          accountKeys
        );
        const movies = accountInfos
          .map((account) => Movie.deserialize(account?.data))
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
