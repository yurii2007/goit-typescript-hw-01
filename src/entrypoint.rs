use solana_program::{
    account_info::AccountInfo,
    entrypoint::{ entrypoint, ProgramResult },
    pubkey::Pubkey,
};
use crate::{
    instruction::IntroInstruction,
    processor::{ add_student_intro, update_student_intro },
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let instruction = IntroInstruction::unpack(instruction_data)?;
    match instruction {
        IntroInstruction::InitUserInput { name, message } => {
            add_student_intro(program_id, accounts, name, message)
        }
        IntroInstruction::UpdateUserInput { name, message } => {
            update_student_intro(program_id, accounts, name, message)
        }
    }
}
