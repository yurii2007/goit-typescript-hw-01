import { approve, burn, revoke } from '@solana/spl-token';

const signature = await burn(
  connection,
  payer, // account which pay transaction fees
  account, // account from which tokens will be burned
  mint, // token mint associated with account
  owner, // owner of the token account
  amount, // amount of tokens to burn
);

// approve the delegate
const delegateSignature = await approve(
  connection,
  payer, //
  account, // account to delegate tokens from
  delegate, // authorized account to transfer or burn tokens
  owner, // owner of the token account
  amount, //
);

const revokeSignature = await revoke(
    connection,
    payer,
    account,
    owner,
)
