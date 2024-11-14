use borsh::{ BorshDeserialize, BorshSerialize };

#[derive(BorshDeserialize, BorshSerialize, Default)]
pub struct MovieAccountState {
    pub is_initialized: bool,
    pub rating: u8,
    pub title: String,
    pub description: String,
}
