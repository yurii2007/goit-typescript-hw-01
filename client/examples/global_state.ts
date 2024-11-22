import { PublicKey } from '@solana/web3.js';

// global state that is shared among users(not sure about users)
const [pda, bump] = await findProgramAddress(
  Buffer.from('GLOBAL_STATE'),
  programId
);

// user specific info(not exactly user, this can be anything, like machine id, account id, purchase id etc)
const [pda, bump] = await PublicKey.findProgramAddressSync(
  [publicKey.toBuffer()],
  programId
);

// multiple items per user, some sort of todos
const [pda, bump] = await PublicKey.findProgramAddressSync(
  [publicKey.toBuffer(), Buffer.from('Shopping list')],
  programId
);

// fetch all the accounts created by program
const fetchProgramAccounts = async () => {
  try {
    const accounts = await connection.getProgramAccounts(programId);
 
    accounts.forEach(({ pubkey, account }) => {
      console.log("Account:", pubkey.toBase58());
      console.log("Data buffer:", account.data);
    });
  } catch (error) {
    console.error("Error fetching program accounts:", error);
  }
};