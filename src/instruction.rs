use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::program_error::ProgramError;

#[derive(BorshDeserialize, BorshSerialize)]
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String,
    },
}

#[derive(BorshDeserialize)]
pub struct MovieReviewPayload {
    title: String,
    rating: u8,
    description: String,
}

impl MovieInstruction {
    pub fn unpack(instruction: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = instruction
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        let payload = MovieReviewPayload::try_from_slice(rest).map_err(
            |_| ProgramError::InvalidInstructionData
        )?;

        match variant {
            0 =>
                Ok(Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
