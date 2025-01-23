use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}

pub type PaymentKeyHash =
  VerificationKeyHash

pub type StakeKeyHash =
  VerificationKeyHash

pub type CampaignState {
  Running
  Cancelled
  Finished
}

// ## Datum

pub type CampaignDatum {
  name: ByteArray,
  goal: Int,
  deadline: Int,
  creator: (PaymentKeyHash, StakeKeyHash),
  state: CampaignState,
  fraction: Int,
}

pub type BackerDatum =
  (PaymentKeyHash, StakeKeyHash)

// ## Redeemer

pub type CampaignAction {
  Cancel
  Finish
  Refund
}

const state_token_script =
  #"70840826b6f202d0b9a1ade2b75b5eca9d326e6a9c7117c071ab4704"

pub const state_token_address =
  Address {
    payment_credential: Script(state_token_script),
    stake_credential: None,
  }
