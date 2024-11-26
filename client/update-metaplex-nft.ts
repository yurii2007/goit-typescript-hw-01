import {
  createGenericFile,
  keypairIdentity,
  publicKey as UmiPublicKey,
} from '@metaplex-foundation/umi';
import path from 'node:path';
import fs from 'node:fs/promises';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import {
  getExplorerLink,
  getKeypairFromFile,
} from '@solana-developers/helpers';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  fetchDigitalAsset,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
  updateV1,
} from '@metaplex-foundation/mpl-token-metadata';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

const ts = new Date();

const connection = new Connection(clusterApiUrl('devnet'));
const user = await getKeypairFromFile();

const umi = createUmi(connection);
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

const mint = UmiPublicKey('2eXKu8Yh87B8znF8sDfcNsxjMsx2PoDNwQwC4HwnKMM9');
const asset = await fetchDigitalAsset(umi, mint);

const updatedNftData = {
  name: 'Updated NFT',
  symbol: 'UPD',
  description: `Upd ${ts}`,
  sellerFeeBasisPoints: 0,
  imageFile: 'nft.png',
};

// @ts-expect-error
const NFTImagePath = path.join(import.meta.dirname, 'assets', 'nft.png');
// const buffer = await fs.readFile(NFTImagePath);
// const file = createGenericFile(buffer, NFTImagePath, {
//   contentType: 'image/png',
// });

// const [image] = await umi.uploader.upload([file]);
// console.log('image url: ', image);

// upload updated offchain json using irys and get metadata uri
// const uri = await umi.uploader.uploadJson({
//   name: 'Updated NFT',
//   symbol: 'UPD',
//   description: `Upd ${ts}`,
//   image,
// });
// console.log('NFT offchain metadata URI:', uri);

const nftMint = UmiPublicKey('2eXKu8Yh87B8znF8sDfcNsxjMsx2PoDNwQwC4HwnKMM9');
const nft = await fetchMetadataFromSeeds(umi, { mint: nftMint });

await updateV1(umi, {
  mint: nftMint,
  authority: umi.identity,
  data: { ...nft, sellerFeeBasisPoints: 0, name: 'Updated' },
  primarySaleHappened: true,
  isMutable: true,
}).sendAndConfirm(umi);

const link = getExplorerLink('address', nftMint, 'devnet');
console.log('updated nft: ', link);
