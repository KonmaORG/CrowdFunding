use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{Finite}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction, ValidityRange,
  find_input,
}
use config
use crowdfunding/types.{
  BackerDatum, CampaignDatum, ConfigDatum, Milestone, Multisig, PaymentKeyHash,
  Running, StakeKeyHash,
}
use test_kit/time/unwrap

pub fn script_address_from_tuple(key_hash_tuple: (PaymentKeyHash, StakeKeyHash)) {
  let (pkh, skh) = key_hash_tuple
  Address {
    payment_credential: pkh |> Script,
    stake_credential: if skh == "" {
      None
    } else {
      skh |> Script |> Inline |> Some
    },
  }
}

pub fn address_from_tuple(key_hash_tuple: (PaymentKeyHash, StakeKeyHash)) {
  let (pkh, skh) = key_hash_tuple
  Address {
    payment_credential: pkh |> VerificationKey,
    stake_credential: if skh == "" {
      None
    } else {
      skh |> VerificationKey |> Inline |> Some
    },
  }
}

pub fn must_consume_creator_nonce(
  tx: Transaction,
  creator: VerificationKeyHash,
  nonce: OutputReference,
) -> Bool {
  let Input(
    output_reference,
    Output { address: Address { payment_credential, .. }, .. },
  ) <- list.any(tx.inputs)

  // the nonce utxo must come from the campaign creator
  and {
    output_reference == nonce,
    VerificationKey(creator) == payment_credential,
  }
}

pub fn must_mint_state_and_reward_token(
  tx: Transaction,
  self_script: PolicyId,
  datum: CampaignDatum,
) -> Bool {
  let CampaignDatum { name, fraction, .. } = datum
  let minted_tokens = tx.mint |> assets.tokens(self_script) |> dict.to_pairs()

  // restrict minting to 1 quantity and 1 asset name with self Policy ID
  [Pair(config.state_token, 1), Pair(name, fraction)] == minted_tokens
}

pub fn must_send_state_reward_token(
  tx: Transaction,
  self_script: PolicyId,
  state_token_address: Address,
  with_datum: CampaignDatum,
) -> Bool {
  let with_datum_data: Data = with_datum
  let self_address = address.from_script(self_script)
  let counter = {
    let Output { address, datum, value, .. } <- list.count(tx.outputs)

    when datum is {
      // STATE token to state_token addr or self_script if state is not running
      InlineDatum(output_datum) -> or {
          and {
            assets.quantity_of(value, self_script, config.state_token) == 1,
            // if with_datum.state == Initiated {
            address == state_token_address,
            // } else {
            //   address == self_address
            // },
            output_datum == with_datum_data,
          },
          and {
            address == self_address,
            assets.quantity_of(value, self_script, with_datum.name) == with_datum.fraction,
            output_datum == with_datum_data,
          },
        }

      // REWARD token to self script addr
      _ -> False
    }
  }

  counter == 2
}

pub fn must_update_state_token(
  tx: Transaction,
  self_script: PolicyId,
  state_token_address: Address,
  with_datum: CampaignDatum,
) -> Bool {
  let with_datum_data: Data = with_datum
  let Output { address, datum, value, .. } <- list.any(tx.outputs)

  when datum is {
    // STATE token to state_token addr or self_script if state is not running
    InlineDatum(output_datum) -> and {
        assets.quantity_of(value, self_script, config.state_token) == 1,
        address == state_token_address,
        output_datum == with_datum_data,
      }

    // REWARD token to self script addr
    _ -> False
  }
}

pub fn is_running_campaign(
  tx_inputs: List<Input>,
  self_script: PolicyId,
) -> Bool {
  // must consume/refer state token UTxO
  expect Some(Input { output: Output { datum, .. }, .. }) = {
    let input <- list.find(tx_inputs)
    assets.quantity_of(input.output.value, self_script, config.state_token) == 1
  }

  // must be campaign inline datum
  expect InlineDatum(campaign_datum) = datum
  expect CampaignDatum { state, .. } = campaign_datum
  state == Running
}

pub fn must_be_signed_by(tx: Transaction, signer: VerificationKeyHash) -> Bool {
  // just expect 1 signer
  [signer] == tx.extra_signatories
}

pub fn must_be_after_deadline(tx: Transaction, deadline: Int) -> Bool {
  // tx validFrom is after or at deadline
  unwrap.finite_start_of(tx.validity_range) >= deadline
}

pub fn must_refund(
  tx: Transaction,
  self_script: PolicyId,
  backer_datum: BackerDatum,
) {
  let backer_datum_data: Data = backer_datum

  // collect input backer support lovelaces from self address
  let self_address = Address(Script(self_script), None)
  let sum_input =
    fn(sum, Input { output: Output { address, datum, value, .. }, .. }) {
      if address == self_address {
        when datum is {
          InlineDatum(input_datum) ->
            if input_datum == backer_datum_data {
              assets.lovelace_of(value) + sum
            } else {
              sum
            }
          _ -> sum
        }
      } else {
        sum
      }
    }
  let input_lovelace = list.reduce(tx.inputs, 0, sum_input)

  // collect output lovelaces to backer address
  let backer_address = address_from_tuple(backer_datum)
  let sum_output =
    fn(sum, Output { address, value, .. }) {
      if address == backer_address {
        assets.lovelace_of(value) + sum
      } else {
        sum
      }
    }
  let output_lovelace = list.reduce(tx.outputs, 0, sum_output)

  output_lovelace >= input_lovelace
}

pub fn must_reach_goal_and_send_to_creator(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
  platform: VerificationKeyHash,
) {
  let CampaignDatum { goal, creator, milestone, .. } = campaign_datum
  let remaining_milestone = list.count(milestone, fn(m) { m == False })
  let self_address = Address(Script(self_script), None)

  // helper fn to sum backer supports from TxInputs
  let sum_support =
    fn(sum, Input { output: Output { address, datum, value, .. }, .. }) {
      if address == self_address {
        when datum is {
          InlineDatum(input_datum) ->
            if input_datum is CampaignDatum {
              assets.lovelace_of(value) + sum
            } else {
              sum
            }
          _ -> sum
        }
      } else {
        sum
      }
    }
  let supports = tx.inputs |> list.reduce(0, sum_support)
  expect supports >= goal
  let (platform_pay, creator_pay) = calculate_payout_platform_creator(supports)
  let creator_address = address_from_tuple(creator)

  // helper fn to sum TxOutputs Lovelace sent to creator
  let sum_creator =
    fn(sum, Output { address, value, .. }) {
      if address == creator_address {
        assets.lovelace_of(value) + sum
      } else {
        sum
      }
    }

  let sum_platform =
    fn(sum, Output { address, value, .. }) {
      when address.payment_credential is {
        VerificationKey(vkh) ->
          if vkh == platform {
            assets.lovelace_of(value) + sum
          } else {
            sum
          }
        _ -> sum
      }
    }

  let sum_script =
    fn(sum, Output { address, value, .. }) {
      if address == self_address {
        assets.lovelace_of(value) + sum
      } else {
        sum
      }
    }

  let to_script =
    if remaining_milestone > 1 {
      list.reduce(tx.outputs, 0, sum_script) >= supports / remaining_milestone
    } else {
      True
    }
  and {
    to_script,
    list.reduce(tx.outputs, 0, sum_creator) >= creator_pay / remaining_milestone,
    list.reduce(tx.outputs, 0, sum_platform) >= platform_pay / remaining_milestone,
  }
}

pub fn find_output_from_PID(
  outputs: List<Output>,
  policy_id: PolicyId,
  name: ByteArray,
) {
  expect [supporter_output,
    script_output] =
    list.filter(
      outputs,
      fn(output) {
        let has_reward_token = output.value |> assets.tokens(policy_id)
        !dict.is_empty(has_reward_token)
      },
    )
  let reward_token_to_backer =
    assets.quantity_of(supporter_output.value, policy_id, name)
  let script_token = assets.quantity_of(script_output.value, policy_id, name)
  (reward_token_to_backer, script_token)
}

pub fn find_output_from_addr(
  outputs: List<Output>,
  self_script: PolicyId,
  name: ByteArray,
) {
  let address = Address(Script(self_script), None)
  expect [script_output,
    backers_amount_output] =
    list.filter(outputs, fn(output) { output.address == address })
  let script_token = assets.quantity_of(script_output.value, self_script, name)
  (assets.lovelace_of(backers_amount_output.value), script_token)
}

pub fn calculate_payout_platform_creator(amount: Int) -> (Int, Int) {
  let platform = amount * 5 / 100
  let seller = amount - platform
  (platform, seller)
}

pub fn atleast_signedby(
  signatories: List<VerificationKeyHash>,
  atleast_signatories: Multisig,
) -> Bool {
  let Multisig { required, signers } = atleast_signatories
  required <= list.count(signers, fn(signer) { list.has(signatories, signer) })
}

pub fn ref_inputs_to_config_datum(
  inputs: List<Input>,
  config_nft: PolicyId,
) -> ConfigDatum {
  expect Some(ref_input) =
    list.find(
      inputs,
      fn(input) { list.has(input.output.value |> assets.policies, config_nft) },
    )
  expect InlineDatum(data) = ref_input.output.datum
  expect datum: ConfigDatum = data
  datum
}

pub fn milestone_status(milestone: List<Bool>) {
  !list.has(milestone, True)
  // expecting milstone list to be false initially
}

pub fn must_send_state_token(
  tx: Transaction,
  oref: OutputReference,
  with_datum: CampaignDatum,
) -> Bool {
  let with_datum_data: Data = with_datum
  expect Some(self_input) = find_input(tx.inputs, oref)
  let self_address = self_input.output.address
  let Output { address, datum, value, .. } <- list.any(tx.outputs)
  when datum is {
    // STATE token to state_token addr or self_script if state is not running
    InlineDatum(output_datum) -> and {
        (address == self_address)?,
        (output_datum == with_datum_data)?,
        assets.match(value, self_input.output.value, >=)?,
      }

    _ -> False
  }
}

pub fn must_happen_before(range: ValidityRange, lock_expiration_time: Int) {
  when range.lower_bound.bound_type is {
    Finite(tx_latest_time) -> lock_expiration_time >= tx_latest_time
    _ -> False
  }
}

pub fn is_datum_addr_same(
  outputs: List<Output>,
  current_datum: CampaignDatum,
  policy_id: PolicyId,
) {
  let current_datum_data: Data = current_datum
  let script_add = Address(Script(policy_id), None)
  list.any(
    outputs,
    fn(o) {
      when o.datum is {
        InlineDatum(output_datum) -> and {
            current_datum_data == output_datum,
            o.address == script_add,
          }
        _ -> False
      }
    },
  )
}

pub fn must_pay_to_script(
  tx: Transaction,
  self_script: PolicyId,
  campaign_datum: CampaignDatum,
) {
  let campaign_datum_data: Data = campaign_datum
  let self_address = Address(Script(self_script), None)
  let sum_support =
    fn(sum, Input { output: Output { address, datum, value, .. }, .. }) {
      if address == self_address {
        when datum is {
          InlineDatum(input_datum) ->
            if input_datum is BackerDatum {
              assets.lovelace_of(value) + sum
            } else {
              sum
            }
          _ -> sum
        }
      } else {
        sum
      }
    }
  let supports = tx.inputs |> list.reduce(0, sum_support)
  list.any(
    tx.outputs,
    fn(o) {
      when o.datum is {
        InlineDatum(datum_data) -> and {
            campaign_datum_data == datum_data,
            o.address == self_address,
            assets.lovelace_of(o.value) >= supports,
          }
        _ -> False
      }
    },
  )
}

pub fn must_burn_reward_token(tx: Transaction, self_script: PolicyId) {
  expect [Pair(_, qty)] =
    tx.mint |> assets.tokens(self_script) |> dict.to_pairs()
  qty < 0
}

pub fn updating_datum_milestone(datum: CampaignDatum) -> CampaignDatum {
  let milestones: Milestone = datum.milestone
  expect Some(index) = list.index_of(milestones, False)
  let updated_milestones =
    list.indexed_map(
      milestones,
      fn(i, m) {
        if i == index {
          !m
        } else {
          m
        }
      },
    )

  CampaignDatum { ..datum, milestone: updated_milestones }
}
