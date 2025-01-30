"use client";

import React from "react";

import dynamic from "next/dynamic";
const Campaign = dynamic(() => import("./campaign"), { ssr: false });
export const CampaignClient = () => {
  return <Campaign />;
};
