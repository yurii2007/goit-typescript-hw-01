import {
  createNft,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
  updateV1,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createGenericFile,
  keypairIdentity,
  percentAmount,
  publicKey,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mockStorage } from '@metaplex-foundation/umi-storage-mock';
import { getKeypairFromFile } from '@solana-developers/helpers';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import fs from 'node:fs/promises';

const umi = createUmi(clusterApiUrl('devnet'));

const keyPair = await getKeypairFromFile();

const umiKeyPair = umi.eddsa.createKeypairFromSecretKey(keyPair.secretKey);

umi
  .use(keypairIdentity(umiKeyPair))
  .use(mplTokenMetadata())
  .use(mockStorage({ baseUrl: '/home/yurii/Desktop/' }));

const filepath = '/home/yurii/Desktop/meepo.jpg';

const buffer = await fs.readFile(filepath);
const file = createGenericFile(buffer, 'test-meepo.jpg', {
  contentType: 'image/jpeg',
});

const [image] = await umi.uploader.upload([file], {});

console.log(image);

const { signature, result } = await createNft(umi, {
  mint,
  name: 'Meepo NFT',
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  // isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: 'finalized' } });

const nft = await fetchMetadataFromSeeds(umi, {
  mint: publicKey(signature.toString()),
});

await updateV1(umi, {
  mint,
  authority: umi.identity,
  data: {
    ...nft, 
    sellerFeeBasisPoints: 0,
    name: "Updated",
  },
  primarySaleHappened: true,
  isMutable: true,
}).sendAndConfirm(umi)