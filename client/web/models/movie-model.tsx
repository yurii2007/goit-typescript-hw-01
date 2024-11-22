import * as borsh from '@coral-xyz/borsh';

export class Movie {
  title: string;
  rating: number;
  description: string;

  constructor(title: string, rating: number, description: string) {
    this.title = title;
    this.rating = rating;
    this.description = description;
  }

  static borshInstructionSchema = borsh.struct([
    borsh.bool('initialized'),
    borsh.u8('rating'),
    borsh.str('title'),
    borsh.str('description'),
  ]);

  public serialize(): Buffer {
    try {
      const buffer = Buffer.alloc(1000); // Adjust size if needed
      Movie.borshInstructionSchema.encode(
        { ...this, initialized: true },
        buffer
      );
      return buffer.subarray(0, Movie.borshInstructionSchema.getSpan(buffer));
    } catch (e) {
      console.error('Serialization error:', e);
      return Buffer.alloc(0);
    }
  }

  public static deserialize(buffer?: Buffer): Movie | null {
    if (!buffer) return null;

    try {
      const { title, rating, description } =
        this.borshInstructionSchema.decode(buffer);
      return new Movie(title, rating, description);
    } catch (error) {
      console.error('Deserialization error:', error);
      console.error('Buffer length:', buffer.length);
      console.error('Buffer data:', buffer.toString('hex'));
      return null;
    }
  }
}
