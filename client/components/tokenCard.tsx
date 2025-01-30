'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { LoaderCircle, Minus, Plus, SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'


import { blockfrost } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NETWORK } from '@/config'
import { useWallet } from '@/context/walletContext'
import { CampaignDatum, MetadataType } from '@/types/cardano'

interface props {
  token: string
  qty: number
  datum?: CampaignDatum
}

export default function TokenCard({ token, qty, datum }: props) {
  const [walletConnection] = useWallet()
  const { lucid, address } = walletConnection
  const [metadata, setMetadata] = useState<MetadataType>()
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const result = await blockfrost.getMetadata(token)

      setMetadata(result)
    }
    fetchData()
  }, [])

  const handleListing = async () => {
    if (!lucid || !address) return
    setSubmitting(true)
    try {
      //console.log(type, address, token, quantity)
    } catch (err: any) {
      console.log(err.message)
    } finally {
      setQuantity(1)
      setPrice(null)
      setSubmitting(false)
    }
  }

  const imageUrl = metadata?.image.replace('ipfs://', 'https://ipfs.io/ipfs/')

  return (
    metadata && (
      <Card className='w-[250px] p-1'>
        <CardHeader className='p-2'>
          <CardTitle className='text-lg font-bold truncate'>
            {metadata.name}
          </CardTitle>
          <CardDescription>
            <Link
              className='flex items-baseline gap-1 text-xs'
              href={`https://${NETWORK == 'Mainnet' ? '' : NETWORK + '.'}cexplorer.io/asset/${token}`}
              rel='noopener noreferrer'
              target='_blank'
            >
              {token.slice(0, 20)}... <SquareArrowOutUpRight size={10} />
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center p-1 relative'>
          <Image
            alt='token image'
            className='rounded-md object-cover'
            height={150}
            src={imageUrl || ''}
            width={200}
          />
          <div className='absolute left-2 bottom-2 rounded-full  bg-primary text-primary-foreground px-1.5 py-1 text-xs'>
            x{qty}
          </div>
        </CardContent>
        <CardFooter className='flex items-center justify-between space-x-2 p-2'>
          <div className='flex items-center border rounded-md h-8 focus-within:ring-1 focus-within:ring-ring'>
            <Button
              className='h-full w-6 rounded-none px-1'
              size='icon'
              variant='ghost'
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              <Minus className='h-3 w-3' />
            </Button>
            <Input
              className='w-6 text-center font-semibold h-8 p-0 border-none text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent'
              placeholder='Quantity'
              type='number'
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            <Button
              className='h-full w-6 rounded-none px-1'
              size='icon'
              variant='ghost'
              onClick={() => setQuantity((prev) => Math.min(qty, prev + 1))}
            >
              <Plus className='h-3 w-3' />
            </Button>
          </div>
          <Button
            className='h-8 text-sm px-4'
            disabled={ submitting}
            onClick={handleListing}
          >
            {submitting && <LoaderCircle className='animate-spin' />}
          </Button>
         
        </CardFooter>
      </Card>
    )
  )
}