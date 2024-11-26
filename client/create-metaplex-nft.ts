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
  publicKey as UmiPublickey,
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

const collectionNftAddress = UmiPublickey(
  '56shxc5gfyM2Vz4a2v9enyzat1ftzjY7H5C3L6BUHh66',
);

const nftData = {
  name: 'My Test NFT',
  symbol: 'MN',
  description: 'My test nft description, should be updated',
  sellerFreeBasisPoints: 0,
  imageFile: 'nft.png',
};

//@ts-expect-error
const nftImagePath = path.join(import.meta.dirname, 'assets', 'nft.png');
const buffer = await fs.readFile(nftImagePath);
const file = createGenericFile(buffer, nftImagePath, {
  contentType: 'image/png',
});

const [image] = await umi.uploader.upload([file]);
console.log('NFT image: ', image);

const uri = await umi.uploader.uploadJson({
  name: 'My Test NFT',
  symbol: 'MN',
  description: 'My test nft description, should be updated',
  image,
});
console.log('Offchain metadata: ', uri);

const mint = generateSigner(umi);

await createNft(umi, {
  mint,
  name: 'My Test NFT',
  symbol: 'MN',
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionNftAddress,
    verified: false,
  },
}).sendAndConfirm(umi, { send: { commitment: 'finalized' } });

const link = getExplorerLink('address', mint.publicKey, 'devnet');
console.log('nft link: ', link);
