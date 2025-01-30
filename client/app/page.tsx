// "use client";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import WalletConnector from "@/components/WalletConnector/client";
import ClientPage from "./client";
// import { useEffect, useState } from "react";
// import { useWallet } from "@/context/walletContext";
// import { UTxO } from "@lucid-evolution/lucid";

export default function Page() {
  return <ClientPage />;
}
