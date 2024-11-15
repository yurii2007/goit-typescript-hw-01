use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::{ error::StudentError, state::StudentInfo };

pub fn add_student_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    message: String
) -> ProgramResult {
    msg!("Adding student intro...");
    msg!("Name: {}", name);
    msg!("Message: {}", message);

    // Get Account iterator
    let account_info_iter = &mut accounts.iter();

    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Derive PDA and check that it matches client
    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature);
    }

    if pda != *user_account.key {
        msg!("Invalid seed for PDA");
        return Err(StudentError::InvalidPDA.into());
    }

    let account_len = 1000;

    // Calculate account size required
    let total_len: usize = 1 + (4 + name.len()) + (4 + message.len());

    if total_len > account_len {
        msg!("Data length must be less than 1000 bytes");
        return Err(StudentError::InvalidDataLength.into());
    }

    // Calculate rent required
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(total_len);

    // Create the account
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            user_account.key,
            rent_lamports,
            total_len.try_into().unwrap(),
            program_id
        ),
        &[initializer.clone(), user_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), &[bump_seed]]]
    )?;

    msg!("PDA created: {}", pda);

    msg!("unpacking state account");

    let mut account_data = StudentInfo::try_from_slice(&user_account.data.as_ref().borrow())?;
    msg!("borrowed account data");

    account_data.name = name;
    account_data.msg = message;
    account_data.is_initialized = true;

    msg!("serializing account");
    account_data.serialize(&mut &mut user_account.data.as_ref().borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn update_student_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    message: String
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;

    if user_account.owner != program_id {
        msg!("Invalid account owner");
        return Err(ProgramError::InvalidAccountOwner);
    }

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);

    if pda != *user_account.key {
        msg!("Invalid seeds for PDA");
        return Err(StudentError::InvalidPDA.into());
    }

    let mut account_data = StudentInfo::try_from_slice(&user_account.data.as_ref().borrow())?;

    if !account_data.is_initialized() {
        msg!("Account is not initialized");
        return Err(ProgramError::UninitializedAccount);
    }

    let total_len = 1 + 1 + (4 + name.len()) + (4 + message.len());

    if total_len > 1000 {
        msg!("Data length must be less than 1000 bytes");
        return Err(StudentError::InvalidDataLength.into());
    }

    account_data.name = name;
    account_data.msg = message;

    account_data.serialize(&mut &mut user_account.data.as_ref().borrow_mut()[..])?;

    Ok(())
}
