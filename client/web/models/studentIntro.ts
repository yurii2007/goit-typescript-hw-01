import * as borsh from '@coral-xyz/borsh';

const ANCHOR_DISCRIMINATOR = 8; // 8 bytes for the account discriminator used by Anchor
const STRING_LENGTH_SPACE = 4; // 4 bytes to store the length of each string

const MESSAGE_SIZE = 500; // Allocate 100 bytes for the 'title'
const NAME_SIZE = 100; // Allocate 500 bytes for the 'description'

const STUDENT_INTRO_SIZE =
  ANCHOR_DISCRIMINATOR + // 8 bytes for the account discriminator
  STRING_LENGTH_SPACE +
  MESSAGE_SIZE + // 4 bytes for the title length + 100 bytes for the title
  STRING_LENGTH_SPACE +
  NAME_SIZE + // 4 bytes for the description length + 500 bytes for the description
  1; // 1 byte for 'variant'

export class StudentIntro {
  name: string;
  message: string;

  constructor(name: string, message: string) {
    this.checkSize(name, NAME_SIZE, `Name cannot exced ${NAME_SIZE} symbols.`);
    this.checkSize(
      message,
      MESSAGE_SIZE,
      `Message cannot exced ${MESSAGE_SIZE} symbols.`
    );
    this.name = name;
    this.message = message;
  }

  static mocks: StudentIntro[] = [
    new StudentIntro(
      'Elizabeth Holmes',
      `Learning Solana so I can use it to build sick NFT projects.`
    ),
    new StudentIntro(
      'Jack Nicholson',
      `I want to overhaul the world's financial system. Lower friction payments/transfer, lower fees, faster payouts, better collateralization for loans, etc.`
    ),
    new StudentIntro('Terminator', `i'm basically here to protect`),
  ];

  private checkSize(text: string, max_size: number, message: string): boolean {
    if (text.length > max_size) {
      throw new Error(message);
    }
    return true;
  }

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  serialize(): Buffer {
    try {
      const buffer = Buffer.alloc(STUDENT_INTRO_SIZE);
      this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
      return buffer.subarray(0, this.borshInstructionSchema.getSpan(buffer));
    } catch (error) {
      console.log('Serialization error', error);
      return Buffer.alloc(0);
    }
  }
}
