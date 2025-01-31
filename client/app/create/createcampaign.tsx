"use client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@heroui/date-picker";
import { Input, Textarea } from "@heroui/input";
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
import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/context/walletContext";
import { CampaignDatum } from "@/types/cardano";
import {
  fromText,
  paymentCredentialOf,
  stakeCredentialOf,
} from "@lucid-evolution/lucid";
import { CreateCampaign } from "@/components/transaction/CreateCampaign";
import { toLovelace } from "@/lib/utils";
import { Switch } from "@heroui/switch";
import { Label } from "@/components/ui/label";

export default function CreateCampaignPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const timezone = getLocalTimeZone();
  const timeNow = fromAbsolute(Date.now(), timezone);
  const [campaignDeadline, setCampaignDeadline] =
    useState<ZonedDateTime | null>(timeNow);
  const [fractions, setFractions] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [isMilestone, setIsMilestone] = useState<boolean>(false);
  const [numberOfMilestones, setNumberOfMilestones] = useState<number>(1);

  const [WalletConnection] = useWallet();
  const { address, lucid } = WalletConnection;

  const handleCreateCampaignClick = useCallback(async () => {
    if (!campaignDeadline || !address || !lucid) return;
    setIsSubmittingTx(true);

    const deadline = BigInt(campaignDeadline.toDate().getTime());
    const datum: CampaignDatum = {
      name: fromText(campaignName),
      goal: toLovelace(+campaignGoal),
      deadline: deadline,
      creator: [
        paymentCredentialOf(address).hash,
        stakeCredentialOf(address).hash,
      ],
      milestone:  new Array(numberOfMilestones).fill(false),
      state: "Initiated",
      fraction: BigInt(fractions),
    };
    await CreateCampaign(
      lucid,
      address,
      datum,
      description,
    );
    setIsSubmittingTx(false);
  }, [campaignName, campaignGoal, campaignDeadline, fractions, description, numberOfMilestones]);

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

                {/* Fractions */}
                <div className="space-y-2">
                  <Input
                  label="Fractions"
                    id="fractions"
                    type="number"
                    value={fractions.toString()}
                    onChange={(e) => {setFractions(Number(e.target.value))}}
                    placeholder="Enter number of fractions"
                  />
                </div>

               
                {/* Description */}
                <div className="space-y-2">
                  <Textarea
                  label="Campaign description"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>


                 {/* Milestones */}
                 <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isMilestone}
                      onChange={(e) => setIsMilestone(e.target.checked)}
                    />
                    <Label htmlFor="milestone">Milestone</Label>
                  </div>

                  
                      <Input
                        id="numberOfMilestones"
                        type="number"
                        value={numberOfMilestones.toString()}
                        onChange={(e) =>
                          {setNumberOfMilestones(Number(e.target.value))
                          console.log(numberOfMilestones, "changed")
                        }}
                        placeholder="Enter number"
                        className={`w-full ${isMilestone ? "" : "invisible"}`}
                      />
                
                </div>

              </ModalBody>
              <ModalFooter>
                {/* Cancel Button */}
                <div className="relative">
                  <Button
                    color="danger"
                    // isDisabled={isSubmittingTx}
                    // variant="flat"
                    onClick={() => {onClose(); setIsSubmittingTx(false);}}
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