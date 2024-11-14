mod instruction;
mod state;

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

use instruction::StudentInstruction;
use state::StudentAccountState;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    account_info: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let payload = StudentInstruction::unpack(instruction_data)?;

    match payload {
        StudentInstruction::RegisterStudent { name, msg } =>
            register_student(program_id, account_info, name, msg),
    }
}

pub fn register_student(
    program_id: &Pubkey,
    account_info: &[AccountInfo],
    name: String,
    msg: String
) -> ProgramResult {
    let account_info_iter = &mut account_info.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[initializer.key.as_ref(), msg.as_bytes().as_ref()],
        program_id
    );

    let account_len = 4 + name.len() + (4 + msg.len()) + 1;

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id
        ),
        &[initializer.clone(), pda_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), msg.as_bytes().as_ref(), &[bump_seed]]]
    )?;

    msg!("Pda created: {}", pda);

    let mut account_data = StudentAccountState::try_from_slice(
        &pda_account.data.as_ref().borrow()
    ).unwrap_or(StudentAccountState::default());

    account_data.is_initialized = true;
    account_data.name = name;
    account_data.msg = msg;

    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    Ok(())
}
