import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MovieReview } from '../target/types/movie_review';
import { expect } from 'chai';

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

  it('add movie review', async () => {
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(movie.rating === account.rating);
    expect(movie.description === account.description);
    expect(account.reviewer === provider.wallet.publicKey);
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
