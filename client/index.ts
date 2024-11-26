import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createGenericFile,
  keypairIdentity,
  percentAmount,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mockStorage } from '@metaplex-foundation/umi-storage-mock';
import { getKeypairFromFile } from '@solana-developers/helpers';
import { clusterApiUrl } from '@solana/web3.js';
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
}).sendAndConfirm(umi, { send: { commitment: 'finalized' } });
