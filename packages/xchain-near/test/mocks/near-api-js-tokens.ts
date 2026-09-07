/** Manual Jest mock for `near-api-js/tokens` (avoids ESM @noble in Jest). */

type FtMetadata = {
  name: string
  symbol: string
  decimals: number
}

type CallProvider = {
  callFunction: (args: {
    contractId: string
    method: string
    args: Record<string, unknown>
  }) => Promise<unknown>
}

type FundingAccount = {
  provider: CallProvider
  callFunction: (args: {
    contractId: string
    methodName: string
    args: Record<string, unknown>
    gas?: bigint
    deposit?: bigint | string | number
  }) => Promise<unknown>
}

export class FungibleToken {
  readonly accountId: string
  readonly metadata: FtMetadata

  constructor(accountId: string, metadata: FtMetadata) {
    this.accountId = accountId
    this.metadata = metadata
  }

  async getBalance({ accountId, provider }: { accountId: string; provider: CallProvider }): Promise<bigint> {
    const balance = await provider.callFunction({
      contractId: this.accountId,
      method: 'ft_balance_of',
      args: { account_id: accountId },
    })
    return BigInt(balance as string | number | bigint)
  }

  async isAccountRegistered({
    accountId,
    provider,
  }: {
    accountId: string
    provider: CallProvider
  }): Promise<boolean> {
    const [storage, required] = await Promise.all([
      provider.callFunction({
        contractId: this.accountId,
        method: 'storage_balance_of',
        args: { account_id: accountId },
      }),
      provider.callFunction({
        contractId: this.accountId,
        method: 'storage_balance_bounds',
        args: {},
      }),
    ])
    if (!storage) return false
    const total = (storage as { total: string | number | bigint }).total
    const min = (required as { min: string | number | bigint }).min
    return BigInt(total) >= BigInt(min)
  }

  async registerAccount({
    accountIdToRegister,
    fundingAccount,
  }: {
    accountIdToRegister: string
    fundingAccount: FundingAccount
  }): Promise<unknown> {
    const bounds = (await fundingAccount.provider.callFunction({
      contractId: this.accountId,
      method: 'storage_balance_bounds',
      args: {},
    })) as { min: string | number | bigint }
    return fundingAccount.callFunction({
      contractId: this.accountId,
      methodName: 'storage_deposit',
      args: {
        account_id: accountIdToRegister,
        registration_only: true,
      },
      deposit: bounds.min,
    })
  }

  async transfer({
    from,
    receiverId,
    amount,
  }: {
    from: FundingAccount
    receiverId: string
    amount: string | number | bigint
  }): Promise<unknown> {
    return from.callFunction({
      contractId: this.accountId,
      methodName: 'ft_transfer',
      args: {
        amount: amount.toString(),
        receiver_id: receiverId,
      },
      deposit: 1,
    })
  }
}
