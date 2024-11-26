import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from '@solana-developers/helpers';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from '@metaplex-foundation/umi';
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import path from 'node:path';
import fs from 'node:fs/promises';

const connection = new Connection(clusterApiUrl('devnet'));

const user = await getKeypairFromFile();

// await airdropIfRequired(
//   connection,
//   user.publicKey,
//   1 * LAMPORTS_PER_SOL,
//   0.1 * LAMPORTS_PER_SOL,
// );

const umi = createUmi(connection);
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

const collectionImagePath = path.join(import.meta.dirname, 'assets', 'collection.png');
const buffer = await fs.readFile(collectionImagePath);

const file = createGenericFile(buffer, collectionImagePath, {
  contentType: 'image/png',
});
const [image] = await umi.uploader.upload([file]);
console.log('Collection image: ', image);

const uri = await umi.uploader.uploadJson({
  name: 'My Test Collection',
  symbol: 'TC',
  description: 'Test Description, should be updated',
  image,
});
console.log('Offchain metadata:', uri);

const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  name: 'My Test Collection',
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: 'finalized' } });

const link = getExplorerLink('address', collectionMint.publicKey, 'devnet');

console.log('Collection NFT: ', link);
console.log('Collection NFT address: ', collectionMint.publicKey);
