use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StudentError {
    #[error("InvalidDataLength")]
    InvalidDataLength,

    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,
}

impl From<StudentError> for ProgramError {
    fn from(e: StudentError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
