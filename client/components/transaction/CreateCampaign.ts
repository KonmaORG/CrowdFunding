import { IdetificationPID } from "@/config";
import { CrowdfundingValidator } from "@/config/scripts/scripts";
import { WalletConnection } from "@/context/walletContext";
import { CampaignDatum } from "@/types/cardano";
import { Constr, paymentCredentialOf } from "@lucid-evolution/lucid";

export async function CreateCampaign(walletConnection: WalletConnection) {
  const { lucid, address } = walletConnection;
  if (!address || !lucid) throw Error("Uninitialized Lucid!!!");
  let utxo = await lucid.utxosAt(address);
  const { txHash, outputIndex } = utxo[0];
  const oref = new Constr(0, [String(txHash), BigInt(outputIndex)]);

  const Campaign_Validator = CrowdfundingValidator([
    paymentCredentialOf(address).hash,
    oref,
    IdetificationPID,
  ]);

  //   const datum: CampaignDatum = {
  //     name: "First",
  //     goal:100n,
  //     deadline:

  //   };

  //  name: Data.Bytes(),
  //   goal: Data.Integer(),
  //   deadline: Data.Integer(),
  //   creator: AddressSchema,
  //   milestone: MilestoneArray,
  //   state: CampaignStateSchema,
  //   fraction: Data.Integer(),
  // }
}
