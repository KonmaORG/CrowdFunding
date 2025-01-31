"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CampaignDatum } from "@/types/cardano"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toAda } from "@/lib/utils"

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
  datum: CampaignDatum
}

export function CampaignModal({ isOpen, onClose, datum }: CampaignModalProps) {
  const [supportAmount, setSupportAmount] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    console.log(`Supporting with amount: ${supportAmount}`)
    onClose()
    setSupportAmount("")
    setError("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSupportAmount(value)

    const amount = Number.parseFloat(value)
    const minAmount = toAda(datum.goal) / Number(datum.fraction)

    if (amount % Number(minAmount) !== 0) {
      setError(`Amount must be a multiple of ${minAmount}`)
    } else {
      setError("")
    }
  }

  const getPredefinedAmounts = () => {
    const baseAmount = toAda(datum.goal) / Number(datum.fraction)
    return [1, 2, 3, 4, 5].map((multiplier) => (Number(baseAmount) * multiplier).toFixed(2))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Support Campaign</DialogTitle>
          <DialogDescription>
            Enter the amount you want to support. Minimum amount: {toAda(datum.goal) / Number(datum.fraction)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {getPredefinedAmounts().map((amount, index) => (
              <Button key={index} variant="outline" onClick={() => setSupportAmount(amount.toString())}>
                {amount}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amount" className="text-right col-span-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={supportAmount}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!!error || !supportAmount}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

