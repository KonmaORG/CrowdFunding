use aiken/cbor
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
  state_token_script: (PaymentKeyHash, StakeKeyHash),
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
  Release
}

test datum123() {
  let datum =
    CampaignDatum {
      name: "abc",
      goal: 100,
      deadline: 1740721010097,
      creator: (
        #"53e442b1918e7f021498ffdce4515c6ae90c44d57cd36e1b5b793ba4",
        #"fe87c58583933bb8079bbad7f95def4595ae570e44ca78d00bbbe481",
      ),
      milestone: [False, False],
      state: Initiated,
      fraction: 2,
    }

  trace @"cbor": cbor.serialise(datum)
  cbor.serialise(datum) == #"d8799f4361626318641b000001954b0eb5b19f581c53e442b1918e7f021498ffdce4515c6ae90c44d57cd36e1b5b793ba4581cfe87c58583933bb8079bbad7f95def4595ae570e44ca78d00bbbe481ff9fd87980d87980ffd8798002ff"
}

test trac12() {
  trace @"wec": 1 == 1
  trace @"false": 1 == 2
  True
}
