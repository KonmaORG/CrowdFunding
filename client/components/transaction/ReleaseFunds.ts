import { IdetificationPID, NETWORK, SIGNER1, SIGNER2 } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { FindRefUtxo, getAddress, privateKeytoAddress } from "@/lib/utils";
import {
  CampaignActionRedeemer,
  CampaignDatum,
  CampaignStateRedeemer,
} from "@/types/cardano";
import {
  Constr,
  credentialToAddress,
  Data,
  fromText,
  keyHashToCredential,
  mintingPolicyToId,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { Milestone } from "lucide-react";

export async function ReleaseFunds(
  WalletConnection: any,
  datum: any,
  metadata: any
) {
  const { address, lucid } = WalletConnection;
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
    const state_addr = getAddress(StateTokenValidator);
    // tokens
    const stateTokenKey = policyId + fromText("STATE_TOKEN");
    // utxos
    const campaignUtxos = await lucid.utxosAt(contarctAddress);
    const state_utxo = await lucid.utxosAtWithUnit(state_addr, stateTokenKey);
    const ref_utxo = await FindRefUtxo(lucid, state_addr);
    // datum & redeemers
    // datum.milestone[datum.milestone.indexOf(false)] = true
    let updatedDatum: CampaignDatum = {
      ...datum,
      state: "Finished",
      milestone: datum.milestone.map((val: any, i: any, a: boolean[]) =>
        i === a.indexOf(false) ? true : val
      ),
    };
    // Campaign creator Address
    const pc = keyHashToCredential(datum.creator[0]);
    const sc = keyHashToCredential(datum.creator[1]);
    const creatorAddress = credentialToAddress(NETWORK, pc, sc);

    // tx
    const tx = await lucid
      .newTx()
      .readFrom(ref_utxo)
      .collectFrom(campaignUtxos, CampaignActionRedeemer.Release)
      .collectFrom(state_utxo, CampaignStateRedeemer.Released)
      .pay.ToContract(
        contarctAddress,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 1n }
      )
      .pay.ToContract(
        state_addr,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 2_000_000n, [stateTokenKey]: 1n }
      )
      .pay.ToAddress(creatorAddress, { lovelace: 1n })
      .attach.SpendingValidator(Campaign_Validator)
      .attach.SpendingValidator(StateTokenValidator())
      .addSigner(await privateKeytoAddress(SIGNER1))
      .addSigner(await privateKeytoAddress(SIGNER2))
      .complete();
    console.log("tx compelte");
    // submit and sign by multisig
  } catch (err: any) {
    console.log(err.message);
    return err.message;
  }
}
