import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { LocalSetup } from '../target/types/local_setup';
import { expect } from 'chai';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { BN } from 'bn.js';

describe('counter', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LocalSetup as Program<LocalSetup>;

  const counter = anchor.web3.Keypair.generate();
  it('Is initialized!', async () => {
    const tx = await program.methods
      .initialize()
      .accounts({ counter: counter.publicKey })
      .signers([counter])
      .rpc();

    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count.toNumber()).to.equal(0);
  });

  it('count increment', async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count.toNumber()).to.equal(1);
  });

  it('count decrement', async () => {
    const tx = await program.methods
      .decrement()
      .accounts({ counter: counter.publicKey, user: provider.wallet.publicKey })
      .rpc();

    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count.toNumber()).to.equal(0);
  });

  it('count decrement with no effect', async () => {
    const tx = await program.methods
      .decrement()
      .accounts({ counter: counter.publicKey, user: provider.wallet.publicKey })
      .rpc();

    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count.toNumber()).to.equal(0);
  });

  it('get filtered accounts with count set to 0', async () => {
    const accounts = await program.account.counter.all([
      {
        memcmp: {
          offset: 8,
          bytes: bs58.encode(new BN(0, 'le').toArray()),
        },
      },
    ]);

    expect(accounts.length).to.equal(1);
  });
});
