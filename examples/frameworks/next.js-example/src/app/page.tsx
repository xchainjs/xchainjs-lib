import { generatePhrase } from '@xchainjs/xchain-crypto'
import { Client, defaultDashParams } from '@xchainjs/xchain-dash'

import { ClientComponent } from '../../components/ClientComponent'

export default async function Home() {
  const client = new Client({
    ...defaultDashParams,
    phrase: generatePhrase(),
  })

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-5">
      <h1 className="text-2xl">Next.js template</h1>
      <p>Get random DASH address from server component: {await client.getAddressAsync()}</p>
      <ClientComponent />
    </main>
  )
}
