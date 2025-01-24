use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding/types.{CampaignAction, CampaignDatum}
use crowdfunding_a

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
    crowdfunding_a.validate_mint_campaign(
      platform,
      creator,
      nonce,
      campaign_datum,
      self_script,
      tx,
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
