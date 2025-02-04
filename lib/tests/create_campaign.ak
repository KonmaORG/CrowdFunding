use cardano/assets
use cardano/transaction.{InlineDatum}
use crowdfunding/types.{CampaignDatum, Initiated}
use crowdfunding/utils
use mocktail/virgin_address.{mock_pub_key_address}
use mocktail/virgin_key_hash.{mock_policy_id}
use test_kit/tx.{add_asset_to_tx_output, add_tx_output, set_datum_of_tx_output}

// use tests/constants.{campaign_address}

test state_token() {
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
  let self_script = mock_policy_id(0)
  //   let campaign_pid = mock_policy_id(1)
  let state_token_address = mock_pub_key_address(1, None)
  let campaign_state_tokens = assets.from_asset(self_script, "STATE_TOKEN", 1)

  let tx_output_1 =
    tx.new_tx_output(state_token_address)
      |> set_datum_of_tx_output(datum |> InlineDatum)
      |> add_asset_to_tx_output(campaign_state_tokens)
  let tx =
    transaction.placeholder
      |> add_tx_output(tx_output_1)

  utils.must_update_state_token(tx, self_script, state_token_address, datum)
}
// // ## Positive Test

// test create_campaign_positive_test() {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// // ## Negative Tests

// test create_campaign_negative_0_goal() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 0,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_past_deadline() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_create_campaign_for_someone_else() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: (#"badb0b", #""),
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_invalid_initial_state() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Finished,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_consume_a_different_nonce_o_ref() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(OutputReference(#"badb0b", 0), creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_consume_a_different_nonce_address() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, #"badb0b" |> address.from_verification_key)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_send_campaign_state_token_to_different_stake_account_address() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address |> address.with_delegation_key(#"badb0b"))
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_does_not_set_campaign_datum() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address) //   |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_does_not_send_campaign_state_token() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(campaign_state_token)

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_does_not_mint_state_token() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input) //   |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)
//       |> set_validity_range(after_now)

//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }

// test create_campaign_negative_does_not_set_transaction_validity_range() fail {
//   let redeemer =
//     CampaignDatum {
//       name: "Campaign Name",
//       goal: 9_000_000_000,
//       deadline: 1928374650000,
//       creator: creator_address,
//       state: Running,
//     }

//   let tx_input =
//     tx.new_tx_input(campaign_nonce, creator_address_from_tuple)
//       |> with_asset_of_tx_input(assets.from_lovelace(2_000_000))

//   let tx_output_1 =
//     tx.new_tx_output(campaign_address)
//       |> set_datum_of_tx_output(redeemer |> InlineDatum)
//       |> add_asset_to_tx_output(campaign_state_token)
//   let tx_output_2 =
//     tx.new_tx_output(creator_address_from_tuple)
//       |> add_asset_to_tx_output(assets.from_lovelace(2_000_000))

//   let tx =
//     transaction.placeholder
//       |> add_tx_input(tx_input)
//       |> add_mint(campaign_state_token)
//       |> add_tx_output(tx_output_1)
//       |> add_tx_output(tx_output_2)

//   //   |> set_validity_range(after_now)
//   functions.validate_mint_campaign(
//     platform_pkh,
//     creator_pkh,
//     campaign_nonce,
//     redeemer,
//     campaign_script,
//     tx,
//   )
// }
