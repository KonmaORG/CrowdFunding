use crowdfunding/types.{Initiated, CampaignDatum}
use cardano/transaction.{OutputReference, Transaction}
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use test_kit/time/unwrap
use crowdfunding/utils
pub fn validate_create_campaign(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
  nonce: OutputReference,
  creator: VerificationKeyHash,
  state_token_script: Address,
) -> Bool {
  expect CampaignDatum { goal, deadline, creator: (pkh, _), state: Initiated, .. } =
    campaign_datum
  expect creator == pkh
  expect goal > 0
  expect unwrap.finite_start_of(tx.validity_range) < deadline
  and {
    utils.must_consume_creator_nonce(tx, creator, nonce)?,
    utils.must_mint_state_and_reward_token(tx, self_script, campaign_datum)?,
    utils.must_send_state_reward_token(
      tx,
      self_script,
      state_token_script,
      campaign_datum,
    )?,
  }
}