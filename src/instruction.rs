use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::program_error::ProgramError;

#[derive(BorshDeserialize, BorshSerialize)]
pub enum StudentInstruction {
    RegisterStudent {
        name: String,
        msg: String,
    },
}

#[derive(BorshDeserialize)]
pub struct RegisterStudentPayload {
    name: String,
    msg: String,
}

impl StudentInstruction {
    pub fn unpack(instruction: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = instruction
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        let payload = RegisterStudentPayload::try_from_slice(rest).map_err(
            |_| ProgramError::InvalidInstructionData
        )?;

        match variant {
            0 =>
                Ok(Self::RegisterStudent {
                    name: payload.name,
                    msg: payload.msg,
                }),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
