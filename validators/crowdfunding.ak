use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding_a
use crowdfunding/types.{CampaignAction, CampaignDatum}
use functions.{validate_create_campaign}


validator campaign(
  platform: VerificationKeyHash,
  creator: VerificationKeyHash,
  nonce: OutputReference,
  state_token_script: Address,
) {
  mint(
    redeemer campaign_datum: CampaignDatum,
    policy_id self_script: PolicyId,
    tx: Transaction,
  ) {
    validate_create_campaign(
        tx,
        self_script,
        campaign_datum,
        nonce,
        creator,
        state_token_script,
      )
  }

  spend(
    datum: Option<Data>,
    redeemer: CampaignAction,
    o_ref: OutputReference,
    tx: Transaction,
  ) {
    crowdfunding_a.validate_spend_campaign(
      platform,
      creator,
      nonce,
      datum,
      redeemer,
      o_ref,
      tx,
      state_token_script,
    )
  }

  else(_) {
    fail
  }
}
