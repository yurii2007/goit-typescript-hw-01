use borsh::{ BorshDeserialize, BorshSerialize };

#[derive(BorshDeserialize, BorshSerialize, Default)]
pub struct StudentAccountState {
    pub is_initialized: bool,
    pub name: String,
    pub msg: String,
}
