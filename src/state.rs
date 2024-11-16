use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ program_pack::{ IsInitialized, Sealed }, pubkey::Pubkey };

#[derive(BorshSerialize, BorshDeserialize)]
pub struct StudentInfo {
    pub discriminator: String,
    pub is_initialized: bool,
    pub name: String,
    pub msg: String,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct StudentRepliesCounter {
    pub discriminator: String,
    pub is_initialized: bool,
    pub counter: u64,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct StudentInfoReply {
    pub is_initialized: bool,
    pub reply: String,
    pub replier: Pubkey,
    pub intro: Pubkey,
    pub discriminator: String,
}

impl Sealed for StudentInfo {}

impl IsInitialized for StudentInfo {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for StudentRepliesCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for StudentInfoReply {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl StudentInfo {
    pub const DISCRIMINATOR: &'static str = "intro";

    pub fn get_account_size(name: &String, message: &String) -> usize {
        StudentInfo::DISCRIMINATOR.len() + 1 + name.len() + message.len() + 64
    }
}

impl StudentInfoReply {
    pub const DISCRIMINATOR: &'static str = "reply";

    pub fn get_account_size(reply: &String) -> usize {
        4 + StudentInfoReply::DISCRIMINATOR.len() + 1 + (4 + reply.len()) + 64 + 64 + 8
    }
}
