import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import 'dotenv/config';

const user = getKeypairFromEnvironment('SECRET_KEY');

const connection = new Connection(clusterApiUrl('devnet'));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

const tokenMintAccount = new PublicKey(
  '6eMsMyNyQWLoJrSo2ytpdLC1f9TFjitqDVPkvh2WmkQi'
);

const metadataData = {
  name: 'Solana test token',
  symbol: 'TRAINING',
  uri: 'https://arweave.net/1234',
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const metadataPDAAndBump = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

const metadataPda = metadataPDAAndBump[0];

const transaction = new Transaction();

const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
  {
    metadata: metadataPda,
    mint: tokenMintAccount,
    mintAuthority: user.publicKey,
    updateAuthority: user.publicKey,
    payer: user.publicKey,
  },
  {
    createMetadataAccountArgsV3: {
      collectionDetails: null,
      data: metadataData,
      isMutable: true,
    },
  }
);

transaction.add(createMetadataInstruction);

const transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [user]
);

const transactionLink = getExplorerLink(
  'transaction',
  transactionSignature,
  'devnet'
);

console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}`);

const tokenMintAccountAddress = getExplorerLink(
  'address',
  tokenMintAccount.toString(),
  'devnet'
);

console.log(`✅ Look at the token mint again: ${tokenMintAccountAddress}`);
