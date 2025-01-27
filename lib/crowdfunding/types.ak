use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}

pub type PaymentKeyHash =
  VerificationKeyHash

pub type StakeKeyHash =
  VerificationKeyHash

pub type CampaignState {
  Initiated
  Running
  Cancelled
  Finished
}

pub type Milestone =
  List<Bool>

// ## Datum

pub type CampaignDatum {
  name: ByteArray,
  goal: Int,
  deadline: Int,
  creator: (PaymentKeyHash, StakeKeyHash),
  milestone: Milestone,
  state: CampaignState,
  fraction: Int,
}

pub type BackerDatum =
  (PaymentKeyHash, StakeKeyHash)

pub type ConfigDatum {
  multisig: Multisig,
  state_token_script: Address,
  platform: VerificationKeyHash,
}

pub type Multisig {
  required: Int,
  signers: List<VerificationKeyHash>,
}

// ## Redeemer

pub type CampaignAction {
  Support
  Cancel
  Finish
  Refund
}
