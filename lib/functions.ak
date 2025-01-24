use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding/types.{BackerDatum, CampaignDatum, Cancelled, Initiated}
use crowdfunding/utils
use test_kit/time/unwrap

pub fn validate_create_campaign(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
  nonce: OutputReference,
  creator: VerificationKeyHash,
  state_token_script: Address,
) -> Bool {
  expect CampaignDatum {
    goal,
    deadline,
    creator: (pkh, _),
    state: Initiated,
    ..
  } = campaign_datum
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

pub fn validate_cancel_campaign(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
  platform: VerificationKeyHash,
  state_token_script: Address,
) -> Bool {
  // platform can only cancel after deadline, creator can cancel at anytime
  let is_signed_by_platform = tx |> utils.must_be_signed_by(platform)
  and {
    if is_signed_by_platform? {
      utils.must_be_after_deadline(tx, campaign_datum.deadline)?
    } else {
      utils.must_be_signed_by(tx, campaign_datum.creator.1st)?
    },
    utils.is_running_campaign(tx.inputs, self_script)?,
    utils.must_send_state_reward_token(
      tx,
      self_script,
      state_token_script,
      with_datum: CampaignDatum { ..campaign_datum, state: Cancelled },
    )?,
  }
}

pub fn validate_refund_support(
  tx: Transaction,
  self_script: PolicyId,
  backer_datum: BackerDatum,
) -> Bool {
  expect !utils.is_running_campaign(tx.reference_inputs, self_script)
  utils.must_refund(tx, self_script, backer_datum)?
}
