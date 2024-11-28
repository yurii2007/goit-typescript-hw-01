use anchor_lang::prelude::*;

declare_id!("27cmrJNLk5YvX4NW8tEit82UtY6L2XhGaRGmFqLuEUYj");

#[program]
pub mod movie_review {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
