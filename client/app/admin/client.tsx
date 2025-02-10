"use client";

import React from "react";

import dynamic from "next/dynamic";
const Admin = dynamic(() => import("./admin"), { ssr: false });
export const AdminClient = () => {
  return <Admin />;
};
