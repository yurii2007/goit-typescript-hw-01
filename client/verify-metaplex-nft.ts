import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  keypairIdentity,
  publicKey as UmiPublicKey,
} from '@metaplex-foundation/umi';
import {
  getExplorerLink,
  getKeypairFromFile,
} from '@solana-developers/helpers';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import {
  findMetadataPda,
  verifyCollectionV1,
} from '@metaplex-foundation/mpl-token-metadata';

const connection = new Connection(clusterApiUrl('devnet'));
const user = await getKeypairFromFile();

const umi = createUmi(connection);
const collectionAddress = UmiPublicKey(
  '56shxc5gfyM2Vz4a2v9enyzat1ftzjY7H5C3L6BUHh66',
);
const nftAddress = UmiPublicKey('2eXKu8Yh87B8znF8sDfcNsxjMsx2PoDNwQwC4HwnKMM9');

const metadata = findMetadataPda(umi, { mint: nftAddress });
await verifyCollectionV1(umi, {
  collectionMint: collectionAddress,
  metadata,
  authority: umi.identity,
}).sendAndConfirm(umi);

const link = getExplorerLink('address', nftAddress, 'devnet');

console.log('verify link: ', link);
