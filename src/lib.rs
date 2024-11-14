mod instruction;

use solana_program::{
    account_info::AccountInfo,
    entrypoint::{ entrypoint, ProgramResult },
    msg,
    pubkey::Pubkey,
};
use instruction::MovieInstruction;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    account_info: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let payload = MovieInstruction::unpack(instruction_data)?;

    match payload {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, account_info, title, rating, description)?;
        }
    }

    Ok(())
}

pub fn add_movie_review(
    program_id: &Pubkey,
    account_info: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    Ok(())
}
