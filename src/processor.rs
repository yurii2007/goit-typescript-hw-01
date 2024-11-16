use crate::{ error::StudentIntroError, state::StudentRepliesCounter };
use crate::instruction::IntroInstruction;
use crate::state::{ StudentInfo, StudentInfoReply };
use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ next_account_info, AccountInfo },
    borsh1::try_from_slice_unchecked,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{ rent::Rent, Sysvar },
};
use std::convert::TryInto;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let instruction = IntroInstruction::unpack(instruction_data)?;
    match instruction {
        IntroInstruction::InitUserInput { name, message } => {
            add_student_intro(program_id, accounts, name, message)
        }
        IntroInstruction::UpdateStudentIntro { name, message } => {
            update_student_intro(program_id, accounts, name, message)
        }
        IntroInstruction::AddReply { reply } => { add_reply(program_id, accounts, reply) }
    }
}

pub fn add_student_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    message: String
) -> ProgramResult {
    msg!("Adding student intro...");
    msg!("Name: {}", name);
    msg!("Message: {}", message);
    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);
    if pda != *user_account.key {
        msg!("Invalid seeds for PDA");
        return Err(StudentIntroError::InvalidPDA.into());
    }

    let total_len = StudentInfo::get_account_size(&name, &message);
    if total_len > 1000 {
        msg!("Data length is larger than 1000 bytes");
        return Err(StudentIntroError::InvalidDataLength.into());
    }
    let account_len: usize = 1000;

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            user_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id
        ),
        &[initializer.clone(), user_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), &[bump_seed]]]
    )?;

    msg!("PDA created: {}", pda);

    msg!("unpacking state account");
    let mut account_data = try_from_slice_unchecked::<StudentInfo>(
        &user_account.data.borrow()
    ).unwrap();
    msg!("borrowed account data");

    msg!("checking if account is already initialized");
    if account_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    account_data.name = name;
    account_data.msg = message;
    account_data.is_initialized = true;
    msg!("serializing account");
    account_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn update_student_intro(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    message: String
) -> ProgramResult {
    msg!("Updating student intro...");
    msg!("Name: {}", name);
    msg!("Message: {}", message);
    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;

    msg!("unpacking state account");
    let mut account_data = StudentInfo::try_from_slice(&user_account.data.borrow()).unwrap();
    msg!("borrowed account data");

    msg!("checking if account is initialized");
    if !account_data.is_initialized() {
        msg!("Account is not initialized");
        return Err(StudentIntroError::UninitializedAccount.into());
    }

    if user_account.owner != program_id {
        return Err(ProgramError::IllegalOwner);
    }

    let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref()], program_id);
    if pda != *user_account.key {
        msg!("Invalid seeds for PDA");
        return Err(StudentIntroError::InvalidPDA.into());
    }
    let update_len: usize = 1 + (4 + account_data.name.len()) + (4 + message.len());
    if update_len > 1000 {
        msg!("Data length is larger than 1000 bytes");
        return Err(StudentIntroError::InvalidDataLength.into());
    }

    account_data.name = account_data.name;
    account_data.msg = message;
    msg!("serializing account");
    account_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn add_reply(program_id: &Pubkey, accounts: &[AccountInfo], reply: String) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_intro = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_reply = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = StudentRepliesCounter::try_from_slice(&pda_counter.data.borrow())?;

    let account_len = StudentInfoReply::get_account_size(&reply);

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[pda_intro.key.as_ref(), counter_data.counter.to_be_bytes().as_ref()],
        program_id
    );

    if pda != *pda_reply.key {
        msg!("Invalid seed for PDA");
        return Err(StudentIntroError::InvalidPDA.into());
    }

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_reply.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id
        ),
        &[initializer.clone(), pda_reply.clone(), system_program.clone()],
        &[&[pda_reply.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(), &[bump_seed]]]
    )?;

    msg!("Account was created");

    let mut reply_data = StudentInfoReply::try_from_slice(&pda_reply.data.borrow_mut()[..])?;

    if reply_data.is_initialized() {
        msg!("Account already created");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    reply_data.discriminator = StudentInfoReply::DISCRIMINATOR.to_string();
    reply_data.reply = reply;
    reply_data.intro = *pda_intro.key;
    reply_data.replier = *initializer.key;
    reply_data.is_initialized = true;

    reply_data.serialize(&mut &mut pda_reply.data.borrow_mut()[..])?;

    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    Ok(())
}
