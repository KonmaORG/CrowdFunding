// use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{from_lovelace}
// use cardano/transaction.{
//   InlineDatum, Input, NoDatum, Output, OutputReference, Transaction, placeholder,
// }
use cardano/transaction.{InlineDatum}
use crowdfunding/types.{CampaignDatum, Finished, Initiated, Running}
use functions
use mocktail/virgin_address.{mock_pub_key_address}
use mocktail/virgin_key_hash.{mock_policy_id, mock_pub_key_hash}
// use mocktail/virgin_output_reference.{mock_utxo_ref}
use tx_util/builder/txn.{
  add_asset_to_tx_output, add_mint, add_tx_input, new_tx_input,
  set_datum_of_tx_output,
}

// use test_kit/tx.{
//   add_asset_to_tx_output, add_mint, add_tx_input, add_tx_output,
//   set_datum_of_tx_output, set_validity_range, with_asset_of_tx_input,
// }
// use tests/constants.{
//   after_now, campaign_address, campaign_nonce, campaign_script,
//   campaign_state_token, creator_address, creator_address_from_tuple, creator_pkh,
//   platform_pkh,
// }

test supoort_pass() {
  let datum =
    CampaignDatum {
      name: "abc",
      goal: 1000000000,
      deadline: 1740721010097,
      creator: (
        #"53e442b1918e7f021498ffdce4515c6ae90c44d57cd36e1b5b793ba4",
        #"fe87c58583933bb8079bbad7f95def4595ae570e44ca78d00bbbe481",
      ),
      milestone: [False, False],
      state: Initiated,
      fraction: 10,
    }

  let reward_pid = mock_policy_id(0)

  let token_name = assets.from_asset(reward_pid, datum.name, 1)
  let token_to_script = assets.from_asset(reward_pid, datum.name, 99)

  let address1 = mock_pub_key_address(0, None)
  let scritp_address = Address(Script(reward_pid), None)

  let supporter_output =
    txn.new_tx_output(address1)
      |> add_asset_to_tx_output(token_name)

  let tx_out_script =
    txn.new_tx_output(scritp_address)
      |> add_asset_to_tx_output(token_to_script)
      |> set_datum_of_tx_output(datum |> InlineDatum)

  let backer_deposit =
    txn.new_tx_output(scritp_address)
      |> add_asset_to_tx_output(from_lovelace(100_000_000))

  functions.validate_support_campaign(
    [supporter_output, tx_out_script, backer_deposit],
    datum,
    reward_pid,
  )
}
