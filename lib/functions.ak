use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding/types.{
  BackerDatum, CampaignDatum, Cancelled, Finished, Initiated, Multisig,
}
use crowdfunding/utils

// use test_kit/time/unwrap

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
    milestone,
    creator: (pkh, _),
    state: Initiated,
    ..
  } = campaign_datum
  expect creator == pkh
  expect goal > 0
  // expect unwrap.finite_start_of(tx.validity_range) < deadline
  // trace @"dead": deadline
  // trace @"validity": unwrap.finite_start_of(tx.validity_range)
  and {
    utils.must_happen_before(tx.validity_range, deadline),
    utils.milestone_status(milestone),
    utils.must_consume_creator_nonce(tx, creator, nonce),
    utils.must_mint_state_and_reward_token(tx, self_script, campaign_datum),
    utils.must_send_state_reward_token(
      tx,
      self_script,
      state_token_script,
      campaign_datum,
    ),
  }
}

pub fn validate_support_campaign(
  tx: Transaction,
  self_script: PolicyId,
  datum: CampaignDatum,
) {
  let Transaction { outputs, reference_inputs, .. } = tx
  let CampaignDatum { name, goal, fraction, .. } = datum
  let fraction_amount = goal / fraction

  let (backer_reward_token, script_reward_token) =
    utils.find_output_from_PID(outputs, self_script, name)

  let (backer_amount, script_token) =
    utils.find_output_from_addr(outputs, self_script, name)

  and {
    utils.is_running_campaign(reference_inputs, self_script),
    script_reward_token == script_token,
    backer_amount / fraction_amount == backer_reward_token,
    utils.is_datum_addr_same(outputs, datum, self_script),
  }
}

pub fn validate_cancel_campaign(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
  multisig: Multisig,
  state_token_script: Address,
) -> Bool {
  trace @"calling cancel function"
  // platform can only cancel after deadline, creator can cancel at anytime
  let is_signed_by_platform =
    utils.atleast_signedby(tx.extra_signatories, multisig)
  and {
    if is_signed_by_platform? {
      utils.must_be_after_deadline(tx.validity_range, campaign_datum.deadline)
    } else {
      utils.must_be_signed_by(tx, campaign_datum.creator.1st)
    },
    utils.is_running_campaign(tx.inputs, self_script),
    utils.must_update_state_token(
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
  and {
    trace @"calling refund function"
    utils.is_campaign_cancelled(tx.outputs, self_script),
    utils.must_refund(tx, self_script, backer_datum)?,
  }
}

pub fn validate_finish_campaign(
  tx: Transaction,
  self_script: PolicyId,
  current_datum: Data,
  state_token_script: Address,
  multisig: Multisig,
) -> Bool {
  if current_datum is campaign_datum: CampaignDatum {
    // platform can only finish after deadline, creator can finish early whevener the goal is reached
    let is_signed_by_platform =
      utils.atleast_signedby(tx.extra_signatories, multisig)
    and {
      if is_signed_by_platform {
        utils.must_be_after_deadline(tx.validity_range, campaign_datum.deadline)
      } else {
        utils.must_be_signed_by(tx, campaign_datum.creator.1st)
      },
      utils.is_running_campaign(tx.inputs, self_script),
      utils.must_update_state_token(
        tx,
        self_script,
        state_token_script,
        with_datum: CampaignDatum { ..campaign_datum, state: Finished },
      ),
      utils.must_pay_to_script(
        tx,
        self_script,
        campaign_datum: CampaignDatum { ..campaign_datum, state: Finished },
      ),
      utils.must_burn_reward_token(tx, self_script),
    }
  } else if current_datum is BackerDatum {
    // must consume state token UTxO successfully
    utils.is_running_campaign(tx.inputs, self_script)?
  } else {
    fail @"Invalid Finish Datum Type!"
  }
}

pub fn validate_release_campaign(
  tx: Transaction,
  self_script: PolicyId,
  current_datum: Data,
  platform: VerificationKeyHash,
  state_token_script: Address,
  multisig: Multisig,
) -> Bool {
  if current_datum is campaign_datum: CampaignDatum {
    // updateCampaign datum's milstone field and set one more false to true
    // and pass the updated datum to the must_update_state_token_function 
    let updated_datum = utils.updating_datum_milestone(campaign_datum)
    and {
      utils.atleast_signedby(tx.extra_signatories, multisig)?,
      (!utils.is_running_campaign(tx.inputs, self_script))?,
      utils.must_update_state_token(
        tx,
        self_script,
        state_token_script,
        updated_datum,
      )?,
      utils.must_reach_goal_and_send_to_creator(
        tx,
        self_script,
        campaign_datum,
        platform,
      )?,
    }
  } else if current_datum is BackerDatum {
    // must consume state token UTxO successfully
    utils.is_running_campaign(tx.inputs, self_script)?
  } else {
    fail @"Invalid Finish Datum Type!"
  }
}
