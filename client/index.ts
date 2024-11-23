import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  createAccount,
  createAssociatedTokenAccount,
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  getAccountLenForMint,
  getMinimumBalanceForRentExemptMint,
  getMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

async function buildCreateMintTransaction(
  connection: Connection,
  payer: PublicKey,
  decimals: number
): Promise<Transaction> {
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const accountKeypair = Keypair.generate();
  const programId = TOKEN_PROGRAM_ID;

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId,
    }),
    createInitializeMintInstruction(
      accountKeypair.publicKey,
      decimals,
      payer,
      payer,
      programId
    )
  );

  return transaction;
}

const createTokenAccount = (
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  keypair: Keypair
) => {
  const tokenAccount = createAccount(connection, payer, mint, owner, keypair);
};

async function buildCreateTokenAccountTransaction(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey
): Promise<Transaction> {
  const mintState = await getMint(connection, mint);
  const accountKeypair = Keypair.generate();
  const space = getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const programId = TOKEN_PROGRAM_ID;

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      programId,
      lamports,
      space,
      newAccountPubkey: accountKeypair.publicKey,
    }),
    createInitializeAccountInstruction(
      accountKeypair.publicKey,
      mint,
      payer,
      programId
    )
  );

  const associatedTokenAccount = await createAssociatedTokenAccount(
    connection,
    payer,
    mint,
    programId
  );

  return transaction;
}
