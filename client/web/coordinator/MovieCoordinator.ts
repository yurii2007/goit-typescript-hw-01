import { Movie } from '@/models/movie-model';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

// account type as returned by getProgramAccounts()
type ProgramAccount = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
};

const DATA_OFFSET = 2; // Skip the first 2 bytes, which store versioning information for the data schema of the account. This versioning ensures that changes to the account's structure can be tracked and managed over time.
const DATA_LENGTH = 18; // Retrieve 18 bytes of data, including the part of the account's data that stores the user's public key for comparison.
// Define a constant for the size of the header in each account buffer
const HEADER_SIZE = 4; // 4 bytes for length header

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export class MovieCoordinator {
  static accounts: PublicKey[] = [];
  static MOVIE_PROGRAM_ID = new PublicKey(MOVIE_REVIEW_PROGRAM_ID);

  static async prefetchAccounts(connection: Connection, search: string) {
    try {
      const readOnlyAccounts = await connection.getProgramAccounts(
        MovieCoordinator.MOVIE_PROGRAM_ID,
        {
          dataSlice: { length: DATA_LENGTH, offset: DATA_OFFSET },
          filters:
            search === ''
              ? []
              : [
                  {
                    memcmp: {
                      offset: 6,
                      bytes: base58.encode(Buffer.from(search)),
                    },
                  },
                ],
        }
      );

      const accounts: Array<ProgramAccount> = Array.from(readOnlyAccounts);

    //   accounts.sort((a, b) => {
    //     try {
    //       // Check if buffers are long enough to avoid out-of-bounds access
    //       const lengthA = a.account.data.readUInt32LE(0); // Reads the first 4 bytes for length
    //       const lengthB = b.account.data.readUInt32LE(0);

    //       if (
    //         a.account.data.length < HEADER_SIZE + lengthA ||
    //         b.account.data.length < HEADER_SIZE + lengthB
    //       ) {
    //         throw new Error('Buffer length is insufficient');
    //       }

    //       const dataA = a.account.data.subarray(
    //         HEADER_SIZE,
    //         HEADER_SIZE + lengthA
    //       );
    //       const dataB = b.account.data.subarray(
    //         HEADER_SIZE,
    //         HEADER_SIZE + lengthB
    //       );

    //       return dataA.compare(dataB);
    //     } catch (error) {
    //       console.error('Error sorting accounts: ', error);
    //       return 0;
    //     }
    //   });

      this.accounts = accounts.map(({ pubkey }) => pubkey);
    } catch (error) {
      console.error(error);
    }
  }

  static async fetchPage(
    connection: Connection,
    page: number,
    limit: number,
    search = '',
    reload = false
  ): Promise<Array<Movie>> {
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search);
    }

    const paginatedKeys = this.accounts.slice(
      page * limit,
      page * limit + limit
    );

    if (paginatedKeys.length === 0) return [];

    const accounts = await connection.getMultipleAccountsInfo(paginatedKeys);

    const movies = accounts.reduce<Movie[]>((acc, account) => {
      try {
        const movie = Movie.deserialize(account?.data);
        return movie ? acc.concat([movie]) : acc;
      } catch (error) {
        console.error('Serialization error', error);
        return acc;
      }
    }, []);

    return movies;
  }
}
