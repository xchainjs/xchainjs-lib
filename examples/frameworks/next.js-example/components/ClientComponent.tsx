'use client'
import { Balance } from '@xchainjs/xchain-client'
import { generatePhrase } from '@xchainjs/xchain-crypto'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { assetToString, baseToAsset } from '@xchainjs/xchain-util'
import { useRequest } from 'ahooks'
import { useRef, useState } from 'react'

export function ClientComponent() {
  const dashClient = useRef<DashClient>()
  const [balance, setBalance] = useState<Balance[]>()
  const { run: getBalance, loading } = useRequest(
    async () => {
      if (!dashClient.current) return undefined
      return dashClient.current.getBalance(await dashClient.current.getAddressAsync())
    },
    {
      pollingInterval: 60 * 1000,
      manual: true,
      onSuccess: setBalance,
    },
  )

  return (
    <div className="flex flex-col items-center gap-y-5">
      <p className="text-xl">Client component</p>
      {!dashClient.current && (
        <button
          className="text-2xl bg-slate-400 p-2 rounded-xl"
          onClick={() => {
            dashClient.current = new DashClient({
              ...defaultDashParams,
              phrase: process.env.NEXT_PUBLIC_PHRASE || generatePhrase(),
            })
            getBalance()
          }}
        >
          Init DASH client with {process.env.NEXT_PUBLIC_PHRASE ? 'your phrase' : 'random phrase'}
        </button>
      )}
      {dashClient.current && (
        <div className="flex flex-col items-center">
          <p>Your address</p>
          <p>{dashClient.current.getAddress()}</p>
        </div>
      )}
      {loading && <p>Loading balance...</p>}
      {balance && (
        <div className="flex flex-col items-center">
          <p>Your balance</p>
          {balance.map((balance, index) => {
            return (
              <div key={index}>
                {assetToString(balance.asset)} {baseToAsset(balance.amount).amount().toString()}
              </div>
            )
          })}
        </div>
      )}
      {dashClient.current && (
        <button
          className="text-2xl bg-slate-400 p-2 rounded-xl"
          onClick={() => {
            dashClient.current?.purgeClient()
            dashClient.current = undefined
            setBalance(undefined)
          }}
        >
          Disconnect client
        </button>
      )}
    </div>
  )
}
