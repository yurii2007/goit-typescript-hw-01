import { Movie } from '@/models/movie-model';
import { Connection, PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export class MovieCoordinator {
  static accounts: PublicKey[] = [];
  static MOVIE_PROGRAM_ID = new PublicKey(MOVIE_REVIEW_PROGRAM_ID);

  static async prefetchAccounts(connection: Connection, search: string) {
    try {
      const accounts = await connection.getProgramAccounts(
        MovieCoordinator.MOVIE_PROGRAM_ID,
        {
          dataSlice: { length: 0, offset: 0 },
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
