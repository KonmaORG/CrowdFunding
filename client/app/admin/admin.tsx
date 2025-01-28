"use client";
import {
  Identification_NFT_Mint,
  sendconfig,
} from "@/components/transaction/Admin";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/walletContext";
import React, { useState } from "react";

export default function Admin() {
  const [walletConnection] = useWallet();
  function onClickHandle() {
    Identification_NFT_Mint(walletConnection);
  }

  function SendConfigOnClick() {
    sendconfig(walletConnection);
  }
  return (
    <>
      <Button onClick={onClickHandle}>Mint Identification Token</Button>
      <Button onClick={SendConfigOnClick}>Send config Datum</Button>
    </>
  );
}
