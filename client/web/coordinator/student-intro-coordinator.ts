import { StudentIntro } from '@/models/studentIntro';
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import base58 from 'bs58';

const HEADER_SIZE = 4;

// initialized + string length
const DATA_OFFSET = 1 + HEADER_SIZE;

export class StudentIntroCoordinator {
  static STUDENT_INTRO_PROGRAM_ID = new PublicKey(
    'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'
  );
  static accounts: PublicKey[] = [];

  static async prefetchAccounts(connection: Connection, search: string) {
    try {
      const accounts = await connection.getProgramAccounts(
        StudentIntroCoordinator.STUDENT_INTRO_PROGRAM_ID,
        {
          dataSlice: { offset: 0, length: 0 },
          filters:
            search !== ''
              ? [
                  {
                    memcmp: {
                      offset: DATA_OFFSET,
                      bytes: base58.encode(Buffer.from(search)),
                    },
                  },
                ]
              : [],
        }
      );

      this.accounts = accounts.map(({ pubkey }) => pubkey);
    } catch (error) {
      console.error('Prefetching error: ', error);
    }
  }

  static async fetchAccounts(
    connection: Connection,
    page: number,
    limit: number,
    search?: string,
    reload = false
  ) {
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search ?? '');
    }

    const paginatedKeys = this.accounts.slice(
      page * limit,
      page * limit + limit
    );

    try {
      const accounts = await connection.getMultipleAccountsInfo(paginatedKeys);

      const studentIntros = accounts.reduce<StudentIntro[]>(
        (accumulator, account) => {
          try {
            const studentIntro = StudentIntro.deserialize(account?.data);

            if (!studentIntro) {
              throw new Error('Deserialization error');
            }

            return accumulator.concat(studentIntro);
          } catch (error) {
            console.error('Error deserializing data: ', error);
          }
          return accumulator;
        },
        []
      );

      return studentIntros;
    } catch (error) {
      console.error('Error fetching accounts: ', error);
      return [];
    }
  }

  static async submitStudentIntro(
    connection: Connection,
    sendTransaction: (
      transaction: Transaction | VersionedTransaction,
      connection: Connection,
      options?: SendTransactionOptions
    ) => Promise<TransactionSignature>,
    publicKey: PublicKey,
    studentIntro: StudentIntro
  ) {
    const buffer = studentIntro.serialize();
    const transaction = new Transaction();

    const [pda] = PublicKey.findProgramAddressSync(
      [publicKey.toBuffer()],
      this.STUDENT_INTRO_PROGRAM_ID
    );

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: publicKey, isSigner: true, isWritable: false },
        { pubkey: pda, isSigner: false, isWritable: true },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: this.STUDENT_INTRO_PROGRAM_ID,
    });

    transaction.add(instruction);

    try {
      const transactionId = await sendTransaction(transaction, connection);
      return { result: true, transactionId };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return { result: false, message: error.message };
    }
  }
}
