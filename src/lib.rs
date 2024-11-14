mod instruction;
mod state;

use std::borrow::Borrow;

use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint::{ entrypoint, ProgramResult },
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use instruction::MovieInstruction;
use state::MovieAccountState;

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
    let account_info_iter = &mut account_info.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[initializer.key.as_ref(), title.as_bytes().as_ref()],
        program_id
    );

    // 4 bytes to store the field's length and actual length plus 8 bytes for the id
    let account_len = 4 + title.len() + (4 + description.len()) + 8;

    let rent = Rent::get()?;
    let rent_lampotrs = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lampotrs,
            account_len.try_into().unwrap(),
            program_id
        ),
        &[initializer.clone(), pda_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]]
    )?;

    msg!("Pda created: {}", pda);

    msg!("Get state account");

    let mut account_data = MovieAccountState::try_from_slice(
        &pda_account.data.as_ref().borrow()
    ).unwrap_or(MovieAccountState::default());

    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    msg!("Serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("State account serialized");
    Ok(())
}
