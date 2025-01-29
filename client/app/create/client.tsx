"use client";

import React from "react";

import dynamic from "next/dynamic";
const CreateCampaignPage = dynamic(() => import("./createcampaign"), {
  ssr: false,
});
export const CampaignClient = () => {
  return <CreateCampaignPage />;
};
