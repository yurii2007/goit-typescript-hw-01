import * as borsh from '@coral-xyz/borsh';

export class StudentIntro {
  name: string;
  message: string;

  constructor(name: string, message: string) {
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

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.bool('initialized'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  serialize(): Buffer {
    try {
      const buffer = Buffer.alloc(1000); // Adjust size if needed
      this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
      return buffer.subarray(0, this.borshInstructionSchema.getSpan(buffer));
    } catch (error) {
      console.error('Serialization error:', error);
      return Buffer.alloc(0);
    }
  }

  static deserialize(buffer?: Buffer): StudentIntro | null {
    if (!buffer) {
      return null;
    }

    try {
      const { name, message } = this.borshAccountSchema.decode(buffer);
      return new StudentIntro(name, message);
    } catch (error) {
      console.error('Deserialization error:', error);
      console.error('Buffer length:', buffer.length);
      console.error('Buffer data:', buffer.toString('hex')); // Log the raw buffer data
      return null;
    }
  }
}
