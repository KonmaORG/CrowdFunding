import { IdetificationPID, NETWORK } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { WalletConnection } from "@/context/walletContext";
import { FindRefUtxo, getAddress, submit } from "@/lib/utils";
import {
  BackerDatum,
  CampaignActionRedeemer,
  CampaignDatum,
  MetadataType,
} from "@/types/cardano";
import {
  Constr,
  Data,
  fromText,
  mintingPolicyToId,
  paymentCredentialOf,
  stakeCredentialOf,
  UTxO,
  validatorToAddress,
} from "@lucid-evolution/lucid";

export async function SupportCampaign(
  WalletConnection: WalletConnection,
  datum: CampaignDatum,
  metadata: MetadataType,
  supportFraction: number
) {
  const { lucid, address } = WalletConnection;
  try {
    if (!address || !lucid) throw Error("Wallet not Conencted");
    // oref
    const oref = new Constr(0, [
      String(metadata.hash),
      BigInt(metadata.outputIndex),
    ]);
    // validator parameter
    const Campaign_Validator = CrowdfundingValidator([
      datum.creator[0],
      oref,
      IdetificationPID,
    ]);
    // validator address & policyId
    const contarctAddress = validatorToAddress(NETWORK, Campaign_Validator);
    const policyId = mintingPolicyToId(Campaign_Validator);
    // tokens
    const reward = fromText(metadata.campaignName);
    const rewardToken = `${policyId}${reward}`;
    const stateToken = policyId + fromText("STATE_TOKEN");
    const payToContract =
      (BigInt(supportFraction) * datum.goal) / datum.fraction;
    // utxo with token
    let utxoWithRewardToken: UTxO[] = await lucid.utxosAtWithUnit(
      contarctAddress,
      rewardToken
    );
    // token qty at script
    const rewardTokenQty = remainingRewardToken(
      utxoWithRewardToken,
      rewardToken
    );
    // redeemer alreadt in Data format
    const redeemer = CampaignActionRedeemer.Support;
    // backer datum
    const backerDatum: BackerDatum = [
      paymentCredentialOf(address).hash,
      stakeCredentialOf(address).hash,
    ];
    // refrence UTxO for ConfigDatum & CampaignDatum StateToken
    const state_addr = getAddress(StateTokenValidator);
    const ref_utxo = await FindRefUtxo(lucid, state_addr);
    const state_utxo = await lucid.utxosAtWithUnit(state_addr, stateToken);
    const tx = await lucid
      .newTx()
      .readFrom([...ref_utxo, ...state_utxo])
      .collectFrom(utxoWithRewardToken, redeemer)
      .pay.ToAddress(address, {
        lovelace: 2n,
        [rewardToken]: BigInt(supportFraction),
      })
      .pay.ToContract(
        contarctAddress,
        { kind: "inline", value: Data.to(datum, CampaignDatum) },
        {
          lovelace: 2n,
          [rewardToken]: BigInt(rewardTokenQty - supportFraction),
        }
      )
      .pay.ToContract(
        contarctAddress,
        { kind: "inline", value: Data.to(backerDatum, BackerDatum) },
        { lovelace: payToContract }
      )
      .attach.SpendingValidator(Campaign_Validator)
      .complete();
    submit(tx);

    return { data: tx, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error.message };
  }
}

function remainingRewardToken(utxos: UTxO[], rewardToken: string) {
  for (const utxo of utxos) {
    for (const [assetKey, quantity] of Object.entries(utxo.assets)) {
      if (assetKey === rewardToken) {
        return Number(quantity);
      }
    }
  }
  return 0;
}
