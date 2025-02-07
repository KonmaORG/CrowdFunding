import { IdetificationPID, NETWORK } from "@/config";
import { emulator } from "@/config/emulator";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { blockfrost, FindRefUtxo, getAddress, submit } from "@/lib/utils";
import { CampaignDatum } from "@/types/cardano";
import {
  Constr,
  fromText,
  LucidEvolution,
  mintingPolicyToId,
  paymentCredentialOf,
  Data,
  validatorToAddress,
  toText,
} from "@lucid-evolution/lucid";

/**
 * Creates a new campaign
 * @param lucid Lucid instance
 * @param address User's wallet address
 * @param campaign Campaign data
 * @param description Campaign description
 *
 * This function creates a new campaign on the blockchain, and mints the campaign token.
 * The campaign data is stored in the transaction's metadata.
 *
 * It first collects the user's UTxO, and reads the state token from the reference UTxO.
 * It then mints the state token and the campaign token, and pays them to the campaign script.
 * It also attaches the campaign data to the transaction's metadata.
 * Finally, it sets the transaction's validity range to the latest block time.
 */
export async function CreateCampaign(
  lucid: LucidEvolution,
  address: string,
  campaign: CampaignDatum,
  description: string
) {
  if (!lucid) throw Error("Uninitialized Lucid!!!");
  let utxo = await lucid.utxosAt(address);
  const { txHash, outputIndex } = utxo[0];
  const oref = new Constr(0, [String(txHash), BigInt(outputIndex)]);

  const Campaign_Validator = CrowdfundingValidator([
    paymentCredentialOf(address).hash,
    oref,
    IdetificationPID,
  ]);
  const PID = mintingPolicyToId(Campaign_Validator);
  const state = fromText("STATE_TOKEN");
  const stateToken = { [`${PID}${state}`]: 1n };

  const reward = campaign.name;
  const reward_fraction = campaign.fraction;
  const rewardToken = { [`${PID}${reward}`]: reward_fraction };

  const state_addr = getAddress(StateTokenValidator);
  const script_addr = validatorToAddress(NETWORK, Campaign_Validator);

  const ref_utxo = await FindRefUtxo(lucid, state_addr);

  // const date = await blockfrost.getLatestTime();
  const date = emulator.now();
  const tx = await lucid
    .newTx()
    .collectFrom([utxo[0]])
    .readFrom(ref_utxo)
    .mintAssets(
      { ...stateToken, ...rewardToken },
      Data.to(campaign, CampaignDatum)
    )
    .pay.ToContract(
      state_addr,
      { kind: "inline", value: Data.to(campaign, CampaignDatum) },
      { lovelace: 2_000_000n, ...stateToken }
    )
    .pay.ToContract(
      script_addr,
      { kind: "inline", value: Data.to(campaign, CampaignDatum) },
      { lovelace: 2_000_000n, ...rewardToken }
    )
    .attachMetadata(721, {
      [PID]: {
        ["STATE_TOKEN"]: {
          name: "STATE_TOKEN",
          campaignName: toText(campaign.name),
          image: "https://avatars.githubusercontent.com/u/106166350",
          description: description,
          hash: utxo[0].txHash,
          outputIndex: utxo[0].outputIndex,
          address: script_addr,
        },
        [toText(campaign.name)]: {
          name: toText(campaign.name),
          campaignName: toText(campaign.name),
          image: "https://avatars.githubusercontent.com/u/106166350",
          description: description,
          hash: utxo[0].txHash,
          outputIndex: utxo[0].outputIndex,
          address: script_addr,
        },
      },
    })
    .attach.MintingPolicy(Campaign_Validator)
    .validFrom(date)
    .complete({});

  console.log({
    name: "STATE_TOKEN",
    campaignName: toText(campaign.name),
    image: "https://avatars.githubusercontent.com/u/106166350",
    description: description,
    hash: utxo[0].txHash,
    outputIndex: utxo[0].outputIndex,
    address: script_addr,
  });

  submit(tx);
}

/// TODO see ariady code for Date.now(deadeline)
