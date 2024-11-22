import * as borsh from '@coral-xyz/borsh';

export class StudentIntro {
  name: string;
  message: string;

  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }

  static borshInstructionSchema = borsh.struct([
    borsh.u8('initialized'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  public serialize(): Buffer {
    try {
      const buffer = Buffer.alloc(1000); // Adjust size if needed
      StudentIntro.borshInstructionSchema.encode(
        { ...this, variant: 0 },
        buffer
      );
      return buffer.subarray(
        0,
        StudentIntro.borshInstructionSchema.getSpan(buffer)
      );
    } catch (error) {
      console.error('Serialization error:', error);
      return Buffer.alloc(0);
    }
  }

  public static deserialize(buffer?: Buffer): StudentIntro | null {
    if (!buffer) return null;

    try {
      const { name, message } = this.borshInstructionSchema.decode(buffer);
      return new StudentIntro(name, message);
    } catch (error: any) {
      console.error('Deserialization error:', error);
      console.error('Buffer length:', buffer.length);
      console.error('Buffer data:', buffer.toString('hex'));
      return null;
    }
  }
}
