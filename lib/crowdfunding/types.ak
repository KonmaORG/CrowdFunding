use aiken/crypto.{VerificationKeyHash}

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

