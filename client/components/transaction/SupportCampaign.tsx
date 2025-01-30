import { WalletConnection } from "@/context/walletContext";
import { CampaignUTxO } from "@/types/CampaignContext";
import { BackerDatum, BackerDatumSchema, CampaignDatum } from "@/types/cardano";
import { Data } from "@lucid-evolution/lucid";
import React from "react";

export async function supportCampaign(
  { lucid, wallet, pkh, skh, address }: WalletConnection,
  campaign?: CampaignUTxO,
  supportADA?: string
): Promise<CampaignUTxO> {
  if (!lucid) throw "Unitialized Lucid";
  if (!wallet) throw "Disconnected Wallet";
  if (!address) throw "No Address";
  if (!campaign) throw "No Campaign";

  //////////////////////////////////////////////////
  const { CampaignInfo } = campaign;

  const backerPKH = pkh ?? "";
  const backerSKH = skh ?? "";

  const backer: BackerDatum = [backerPKH, backerSKH];
  const datum = Data.to(backer);

  const support = supportADA ?? "0";
  const ada = parseFloat(support);
  const lovelace = adaToLovelace(support);

  const tx = await lucid
    .newTx()
    .pay.ToContract(
      CampaignInfo.address,
      { kind: "inline", value: datum },
      { lovelace }
    )
    .complete();

  const txHash = await submitTx(tx);

  handleSuccess(`Support Campaign TxHash: ${txHash}`);

  return {
    ...campaign,
    CampaignInfo: {
      ...CampaignInfo,
      data: {
        ...CampaignInfo.data,
        backers: [
          ...CampaignInfo.data.backers,
          {
            address,
            pkh: backerPKH,
            skh: backerPKH,
            pk: keyHashToCredential(backerPKH),
            sk: keyHashToCredential(backerSKH),
            support: { ada, lovelace },
            utxo: {
              txHash,
              outputIndex: 0,
              address: CampaignInfo.address,
              assets: { lovelace },
              datum,
            },
          },
        ],
        support: {
          ada: CampaignInfo.data.support.ada + ada,
          lovelace: CampaignInfo.data.support.lovelace + lovelace,
        },
      },
    },
  };

  ///////////////////////////////////////////////

  return {} as CampaignUTxO;
}
function adaToLovelace(support: string) {
  throw new Error("Function not implemented.");
}
