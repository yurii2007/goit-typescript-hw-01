use anchor_lang::prelude::*;

// Anchor discriminator size, that is needed to calculate the space required for the account.
const ANCHOR_DISCRIMINATOR: usize = 8;

declare_id!("AF5TqVfSoYxBTQdJtjrJbCiAuKPU5zNGUJwmSgBaqYFw");

#[program]
pub mod anchor_counter {
  use super::*;

  pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    // Initialize the counter account to 0.
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;

    // Log the current count.
    msg!("Counter account created. Current count: {}", counter.count);
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    // Get the current count and log it.
    let counter = &mut ctx.accounts.counter;
    msg!("Previous counter: {}", counter.count);

    // Increment the count and log it.
    counter.count = counter.count.checked_add(1).unwrap();
    msg!("Counter incremented. Current count: {}", counter.count);
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    // Get the current count and log it.
    let counter = &mut ctx.accounts.counter;
    msg!("Previous counter: {}", counter.count);

    // Increment the count and log it.
    counter.count = counter.count.checked_sub(1).unwrap();
    msg!("Counter incremented. Current count: {}", counter.count);
    Ok(())
  }

  pub fn close(ctx: Context<Close>) -> Result<()> {
    Ok(())
  }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(init, payer = user, space = ANCHOR_DISCRIMINATOR + Counter::INIT_SPACE)]
  pub counter: Account<'info, Counter>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub counter: Account<'info, Counter>,
  pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
  pub count: u64,
}

#[derive(Accounts)]
#[instruction(instruction_data: String)]
pub struct Example<'info> {
  #[account(
    init_if_needed,
    seeds = [b"seed", user.key().as_ref()],
    bump,
    payer = user,
    space = ANCHOR_DISCRIMINATOR + AccountType::INIT_SPACE
  )]
  pub pda_account: Account<'info, AccountType>,

  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct AccountType {
  data: u64,
}

#[derive(Accounts)]
#[instruction(input: String)]
pub struct ReallocExample<'info> {
  #[account(mut, seeds = [b"example", user.key().as_ref()], realloc = ANCHOR_DISCRIMINATOR + 4 + input.len(), realloc::payer = user, realloc::zero = false, bump)]
  pub pda_account: Account<'info, AccountType>,

  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Close<'info> {
  #[account(mut, close = receiver)]
  pub data_account: Account<'info, AccountType>,

  #[account(mut)]
  pub receiver: Signer<'info>,
}
