use anchor_lang::prelude::*;

declare_id!("8icGqXZFXN2eHm8hHTkEgje4e76BpyWD44y1bkaWQz4k");

const ANCHOR_DISCRIMINATOR: usize = 8;
const MAX_NAME_LENGTH: usize = 20;
const MAX_MESSAGE_LENGTH: usize = 40;

#[program]
pub mod students_intro {
    use super::*;

    pub fn add_student_intro(
        ctx: Context<AddStudentIntro>,
        name: String,
        message: String
    ) -> Result<()> {
        check_inputs(&name, &message)?;

        msg!("New student name: {}", name);
        msg!("New student message: {}", message);

        let student_intro = &mut ctx.accounts.student_intro;
        student_intro.student = ctx.accounts.initializer.key();
        student_intro.name = name;
        student_intro.message = message;

        msg!("Initialized account for {} successfully", ctx.accounts.initializer.key().to_string());

        Ok(())
    }

    pub fn update_student_intro(
        ctx: Context<UpdateStudentIntro>,
        name: String,
        message: String
    ) -> Result<()> {
        check_inputs(&name, &message)?;

        let student_intro = &mut ctx.accounts.student_intro;
        student_intro.message = message;

        msg!("Updating message for {}", ctx.accounts.initializer.key().to_string());

        Ok(())
    }

    pub fn delete_student_intro(ctx: Context<DeleteStudentIntro>, name: String) -> Result<()> {
        msg!(
            "Deleting intro for {} with key: {}",
            name,
            ctx.accounts.initializer.key().to_string()
        );

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, message: String)]
pub struct AddStudentIntro<'info> {
    #[account(
        init,
        seeds = [name.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = ANCHOR_DISCRIMINATOR + StudentIntroState::INIT_SPACE
    )]
    pub student_intro: Account<'info, StudentIntroState>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, message: String)]
pub struct UpdateStudentIntro<'info> {
    #[account(
        mut,
        seeds = [name.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = ANCHOR_DISCRIMINATOR + StudentIntroState::INIT_SPACE,
        realloc::payer = initializer,
        realloc::zero = true
    )]
    pub student_intro: Account<'info, StudentIntroState>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct DeleteStudentIntro<'info> {
    #[account(mut, seeds = [name.as_bytes(), initializer.key().as_ref()], bump, close = initializer)]
    pub student_intro: Account<'info, StudentIntroState>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct StudentIntroState {
    student: Pubkey,
    #[max_len(20)]
    name: String,
    #[max_len(40)]
    message: String,
}

#[error_code]
enum StudentIntroError {
    #[msg("Name should be less than 20 characters and non-empty")]
    InvalidName,

    #[msg("Message should be less than 40 characters and non-empty")]
    InvalidMessage,
}

fn check_inputs(name: &String, message: &String) -> Result<()> {
    require!(name.len() > 0 && name.len() <= MAX_NAME_LENGTH, StudentIntroError::InvalidName);
    require!(
        message.len() > 0 && message.len() <= MAX_MESSAGE_LENGTH,
        StudentIntroError::InvalidMessage
    );

    Ok(())
}
