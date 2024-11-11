import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

let providedKey = process.argv[2];

if (!providedKey) {
  console.warn("No key provided, continue using device owner's key");
  providedKey = "H1Am3NAM61YihPyzGcu2h1ftofR7w3EYXG8QfXj8CaJj";
}

let publicKey: PublicKey;

try {
  publicKey = new PublicKey(providedKey);
} catch (error) {
  console.error("Invalid key provided");
  process.exit(1);
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(`Balance in SOL = ${balanceInSOL}`);
