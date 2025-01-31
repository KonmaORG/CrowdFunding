import { IdetificationPID, NETWORK } from "@/config";
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

export async function CreateCampaign(
  lucid: LucidEvolution,
  address: string,
  campaign: CampaignDatum
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

  // console.log(Data.to(campaign, CampaignDatum));
  // console.log(campaign.deadline, campaign.goal, campaign.creator);
  // const date1 = Math.floor(Number(campaign.deadline));
  const date = await blockfrost.getLatestTime();
  console.log(date);
  console.log("adddr", state_addr);
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
        [toText(campaign.name)]: {
          name: campaign.name,
          image: "https://avatars.githubusercontent.com/u/106166350",
        },
      },
    })
    .attach.MintingPolicy(Campaign_Validator)
    .validFrom(date)
    .complete({ canonical: false });

  submit(tx);
  console.log("Campaign name", toText(campaign.name));
  console.log("Campaign Goal", campaign.goal);
  console.log(
    "Campaign Deadline:",
    new Date(Number(campaign.deadline)).toLocaleString()
  );
}

/// TODO see ariady code for Date.now(deadeline)
