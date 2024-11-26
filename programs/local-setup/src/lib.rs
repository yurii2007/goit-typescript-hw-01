use anchor_lang::prelude::*;

declare_id!("CkhQFVDE6MtP7TGN8dgYhYEgo3knXSQ6gpH8XnUx3ke6");

#[program]
pub mod local_setup {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
