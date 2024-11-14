mod instruction;

use solana_program::{
    account_info::AccountInfo,
    entrypoint::{ entrypoint, ProgramResult },
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::BorshDeserialize;
use crate::instruction::*;

impl NoteInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        let payload = NoteInstructionPayload::try_from_slice(rest).map_err(
            |_| ProgramError::InvalidInstructionData
        )?;

        match variant {
            0 => Ok(Self::CreateNote { body: payload.body, id: payload.id, title: payload.title }),
            1 => Ok(Self::UpdateNote { body: payload.body, id: payload.id, title: payload.title }),
            2 => Ok(Self::DeleteNote { id: payload.id }),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    account_info: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Notes entry point");

    let instruction = NoteInstruction::unpack(instruction_data)?;

    match instruction {
        NoteInstruction::CreateNote { title, body, id } => {
            msg!("creating note");
        }
        NoteInstruction::UpdateNote { title, body, id } => {
            msg!("updating note");
        }
        NoteInstruction::DeleteNote { id } => {
            msg!("deleting note");
        }
    }
    Ok(())
}

fn main() {}
