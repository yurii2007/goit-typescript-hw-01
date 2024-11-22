import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

type ProgramAccount = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
};

const DATA_OFFSET = 2; // Skip the first 2 bytes, which store versioning information for the data schema of the account. This versioning ensures that changes to the account's structure can be tracked and managed over time.
const DATA_LENGTH = 18; // Retrieve 18 bytes of data, including the part of the account's data that stores the user's public key for comparison.

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

export default async function fetchMatchingContactAccounts(
  connection: Connection,
  search: string
): Promise<Array<AccountInfo<Buffer> | null>> {
  let filters: Array<{ memcmp: { offset: number; bytes: string } }> = [];

  if (search.length > 0) {
    filters = [
      {
        memcmp: {
          offset: DATA_OFFSET,
          bytes: base58.encode(Buffer.from(search)), // Convert the search string to Base58 for comparison with the on-chain data.
        },
      },
    ];
  }

  // Get readonly accounts response
  const readonlyAccounts = await connection.getProgramAccounts(
    new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    {
      dataSlice: { offset: DATA_OFFSET, length: DATA_LENGTH }, // Only retrieve the portion of data relevant to the search.
      filters,
    }
  );

  // Make a mutable copy of the readonly array
  const accounts: Array<ProgramAccount> = Array.from(readonlyAccounts);

  return accounts.map((account) => account.account); // Return the account data.
}
