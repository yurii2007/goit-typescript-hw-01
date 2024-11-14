use borsh::BorshDeserialize;

pub enum NoteInstruction {
    CreateNote {
        title: String,
        body: String,
        id: u64,
    },
    UpdateNote {
        title: String,
        body: String,
        id: u64,
    },
    DeleteNote {
        id: u64,
    },
}

#[derive(BorshDeserialize)]
pub struct NoteInstructionPayload {
    pub id: u64,
    pub title: String,
    pub body: String,
}
