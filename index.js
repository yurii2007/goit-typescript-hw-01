import 'dotenv';
import {getKeypairFromEnvironment} from "@solana-developers/helpers"

const keypayir = getKeypairFromEnvironment('SECRET_KEY');

console.log('public key', keypayir.publicKey.toBase58());
console.log('secret key', keypayir.secretKey);