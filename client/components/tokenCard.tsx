"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

import { blockfrost, toAda } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NETWORK } from "@/config";
import type { CampaignDatum, MetadataType } from "@/types/cardano";
import { CampaignModal } from "./campaignModal";
import { FinishCampaign } from "./transaction/FininshCampaign";
import { useWallet } from "@/context/walletContext";
import { ApproveCampaign } from "./transaction/ApproveCampaign";

interface TokenCardProps {
  token: string;
  qty: number;
  datum: CampaignDatum;
}

export function TokenCard({ token, qty, datum }: TokenCardProps) {
  const [metadata, setMetadata] = useState<MetadataType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [WalletConnection] = useWallet();

  useEffect(() => {
    async function fetchData() {
      const result = await blockfrost.getMetadata(token);
      setMetadata(result);
    }
    fetchData();
  }, [token]);

  const handleSupport = () => {
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!metadata) return;
    ApproveCampaign(WalletConnection, datum, metadata);
  };
  const handleFinish = async () => {
    if (!metadata) return;
    FinishCampaign(WalletConnection, datum, metadata);
  };

  const imageUrl = metadata?.image.replace("ipfs://", "https://ipfs.io/ipfs/");

  return (
    metadata && (
      <Card className="w-[250px] p-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg font-bold truncate">
            {metadata.campaignName}
          </CardTitle>
          <CardDescription>
            <Link
              className="flex items-baseline gap-1 text-xs"
              href={`https://${NETWORK == "Mainnet" ? "" : NETWORK + "."}cexplorer.io/asset/${token}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {token.slice(0, 20)}... <SquareArrowOutUpRight size={10} />
            </Link>
            {metadata.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-1 relative">
          <Image
            alt="token image"
            className="rounded-md object-cover"
            height={200}
            src={imageUrl || ""}
            width={200}
          />
          <div className="absolute left-2 bottom-2 rounded-full  bg-primary text-primary-foreground px-1.5 py-1 text-xs">
            Goal: {toAda(datum.goal)}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between space-x-2 p-2">
          <Button onClick={handleApprove}>Approve</Button>
          <Button className="h-8 text-sm px-4" onClick={handleSupport}>
            Support
          </Button>
          <Button onClick={handleFinish}>Finish</Button>
        </CardFooter>
        <CampaignModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          datum={datum}
          metadata={metadata}
        />
      </Card>
    )
  );
}
