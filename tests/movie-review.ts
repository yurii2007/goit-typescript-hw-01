import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { expect } from 'chai';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { MovieReview } from '../target/types/movie_review';

describe('movie-review', () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const movie = {
    title: 'Test movie',
    description: 'Nice one',
    rating: 3,
  };

  const program = anchor.workspace.MovieReview as Program<MovieReview>;

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('mint')],
    program.programId
  );

  it('Initialize the reward token', async () => {
    const tx = await program.methods.initializeMint().rpc();
  });

  it('add movie review', async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );

    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        tokenAccount: tokenAccount,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(account.title).to.equal(movie.title);
    expect(account.rating).to.equal(movie.rating);
    expect(account.description).to.equal(movie.description);
    expect(account.reviewer.toBase58()).to.equal(
      provider.wallet.publicKey.toBase58()
    );

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal(10 * (10 ^ 6));
  });

  it('update movie review', async () => {
    const updatedDescription = 'Upd';
    const updatedRating = 2;

    const tx = await program.methods
      .updateMovieReview(movie.title, updatedDescription, updatedRating)
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(updatedRating === account.rating);
    expect(updatedDescription === account.description);
  });

  it('delete movie review', async () => {
    await program.methods.deleteMovieReview(movie.title).rpc();
  });
});
