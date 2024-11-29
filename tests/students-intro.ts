import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { StudentsIntro } from '../target/types/students_intro';
import { expect } from 'chai';

describe('students-intro', () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const studentIntro = {
    name: 'Test student',
    message: 'hello world',
  };

  const program = anchor.workspace.StudentsIntro as Program<StudentsIntro>;

  const [studentPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(studentIntro.name), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  it('create student intro', async () => {
    const tx = await program.methods
      .addStudentIntro(studentIntro.name, studentIntro.message)
      .rpc();

    const account = await program.account.studentIntroState.fetch(studentPda);
    expect(account.name).to.equal(studentIntro.name);
    expect(account.message).to.equal(studentIntro.message);
    expect(account.student.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
  });
});
