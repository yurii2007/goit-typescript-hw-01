use anchor_lang::prelude::*;

declare_id!("CkhQFVDE6MtP7TGN8dgYhYEgo3knXSQ6gpH8XnUx3ke6");

#[program]
pub mod local_setup {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Account created");
        msg!("Count: {}", counter.count);
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Counter value was updated, new value: {}", counter.count);
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        if counter.count < 1 {
            msg!("Counter value is less than 1");
        } else {
            counter.count = counter.count.checked_sub(1).unwrap();
            msg!("Conuter value decreased");
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = DISCRIMINATOR + Counter::INIT_SPACE)]
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

const DISCRIMINATOR: usize = 8;
