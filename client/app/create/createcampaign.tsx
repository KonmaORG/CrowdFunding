"use client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  fromAbsolute,
  getLocalTimeZone,
  ZonedDateTime,
} from "@internationalized/date";
import React, { useCallback, useState } from "react";
import { useWallet } from "@/context/walletContext";
import { CampaignDatum } from "@/types/cardano";
import {
  fromHex,
  fromText,
  paymentCredentialOf,
  stakeCredentialOf,
  toText,
} from "@lucid-evolution/lucid";
import { CreateCampaign } from "@/components/transaction/CreateCampaign";

export default function CreateCampaignPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const timezone = getLocalTimeZone();
  const timeNow = fromAbsolute(Date.now(), timezone);
  const [campaignDeadline, setCampaignDeadline] =
    useState<ZonedDateTime | null>(timeNow);

  const [WalletConnection] = useWallet();
  const { address, lucid } = WalletConnection;

  const handleCreateCampaignClick = useCallback(async () => {
    if (!campaignDeadline || !address || !lucid) return;
    setIsSubmittingTx(true);

    const deadline = BigInt(campaignDeadline.toDate().getTime());
    const datum: CampaignDatum = {
      name: fromText(campaignName),
      goal: BigInt(campaignGoal),
      deadline: deadline,
      creator: [
        paymentCredentialOf(address).hash,
        stakeCredentialOf(address).hash,
      ],
      milestone: [false, false],
      state: "Initiated",
      fraction: 2n,
    };
    await CreateCampaign(lucid, address, datum);
    setIsSubmittingTx(false);
  }, [campaignName, campaignGoal, campaignDeadline]);

  return (
    <>
      <Button
        className="w-fit"
        color="primary"
        onClick={onOpen}
        // radius="full"
        // variant="shadow"
      >
        Create Campaign
      </Button>

      <Modal
        backdrop="blur"
        hideCloseButton={isSubmittingTx}
        isDismissable={false}
        isKeyboardDismissDisabled={isSubmittingTx}
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Campaign
              </ModalHeader>
              <ModalBody>
                {/* Campaign Name */}
                <Input
                  autoFocus
                  // isDisabled={isSubmittingTx}
                  label="Campaign Name"
                  placeholder="Enter campaign name"
                  onValueChange={setCampaignName}
                />

                {/* Campaign Goal */}
                <Input
                  // isDisabled={isSubmittingTx}
                  label="Campaign Goal"
                  max={45_000_000_000.0}
                  min={0}
                  placeholder="0.000000"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">ADA</span>
                    </div>
                  }
                  step={1}
                  type="number"
                  onValueChange={setCampaignGoal}
                />

                {/* Campaign Deadline */}
                <DatePicker
                  hideTimeZone
                  showMonthAndYearPickers
                  defaultValue={timeNow}
                  isDisabled={isSubmittingTx}
                  label="Set Deadline"
                  minValue={timeNow}
                  onChange={setCampaignDeadline}
                />
              </ModalBody>
              <ModalFooter>
                {/* Cancel Button */}
                <div className="relative">
                  <Button
                    color="danger"
                    // isDisabled={isSubmittingTx}
                    // variant="flat"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="relative">
                  <Button
                    className={isSubmittingTx ? "invisible" : ""}
                    color="primary"
                    onClick={() => {
                      setIsSubmittingTx(true);
                      handleCreateCampaignClick();
                    }}
                  >
                    Submit
                  </Button>
                  {isSubmittingTx && (
                    <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
