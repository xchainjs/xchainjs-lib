import { AssetBTC, Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { FeeType, Network } from '@xchainjs/xchain-client'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { assetToBase, assetAmount, baseAmount } from '@xchainjs/xchain-util'

import { Wallet } from '@xchainjs/xchain-wallet'

describe('Wallet', () => {
  describe('Instantiation', () => {
    it('Should instantiate with no clients', () => {
      const wallet = new Wallet({})
      expect(wallet).not.toBeNull()
    })

    it('Should instantiate with multiple clients', () => {
      expect(
        new Wallet({
          BTC: new BtcClient({ ...defaultBTCParams, network: Network.Testnet }),
          ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
        }),
      ).toBeDefined()
    })

    it('Should not instantiate because of network mismatch', () => {
      expect(() => {
        new Wallet({
          BTC: new BtcClient({ ...defaultBTCParams, network: Network.Mainnet }),
          ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
        })
      }).toThrow('Clients not working on the same network')
    })
  })

  describe('Client management', () => {
    let wallet: Wallet
    beforeEach(() => {
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBTCParams, network: Network.Testnet }),
        ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
      })
    })

    it('Should get network', () => {
      expect(wallet.getNetwork()).toBe(Network.Testnet)
    })

    it('Should set network', () => {
      wallet.setNetwork(Network.Mainnet)
      expect(wallet.getNetwork()).toBe(Network.Mainnet)
    })

    it('Should add client', () => {
      expect(wallet.addClient('THOR', new ThorClient({ network: Network.Testnet }))).toBeTruthy()
    })

    it('Should not add client because it is already added', () => {
      expect(wallet.addClient('BTC', new BtcClient({ ...defaultBTCParams, network: Network.Testnet }))).toBeFalsy()
    })

    it('Should not add client because of network mismatch', () => {
      expect(() => {
        wallet.addClient('THOR', new ThorClient({ network: Network.Mainnet }))
      }).toThrow(`Trying to add client in different network. Expected ${Network.Testnet} but got ${Network.Mainnet}`)
    })

    it('Should purge client', () => {
      expect(wallet.purgeClient('BTC')).toBeTruthy()
    })

    it('Should not purge client because it is not added', () => {
      expect(wallet.purgeClient('THOR')).toBeFalsy()
    })

    it('Should purge wallet', () => {
      expect(wallet.purgeWallet()).toBeTruthy()
    })
  })

  describe('Features', () => {
    let wallet: Wallet
    beforeEach(() => {
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBTCParams, network: Network.Mainnet }),
        ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      })
    })
    it('Should validate wallet address correctly', () => {
      expect(wallet.validateAddress('ETH', '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5')).toBeTruthy()
    })

    it('Should validate wallet address incorrectly', () => {
      expect(wallet.validateAddress('ETH', 'bc1qzuvglz80shw8pzk7czjsfnu7y3ye9uzu2y5caw')).toBeFalsy()
    })

    it('Should not validate unknown client address', () => {
      expect(() => {
        wallet.validateAddress('THOR', 'thor166n4w5039meulfa3p6ydg60ve6ueac7tlt0jws')
      }).toThrow(/Client not found for THOR chain/)
    })

    it('Should get explorer url', async () => {
      expect(await wallet.getExplorerUrl('BTC')).toBeDefined()
    })

    it('Should not get explorer url from unknown client', async () => {
      await expect(async () => {
        await wallet.getExplorerUrl('THOR')
      }).rejects.toThrow(/Client not found for THOR chain/)
    })

    it('Should get address url', async () => {
      expect(await wallet.getExplorerAddressUrl('BTC', 'bc1qlz7nwctel57wxm9hyzf20hzhkflw8nasx3c7gy')).toBeDefined()
    })

    it('Should not get address url from unknown client', async () => {
      await expect(async () => {
        await wallet.getExplorerAddressUrl('THOR', 'thor1dj5wnd3q9c48g9cuylldfxrpvfjgqk7nsjzlcl')
      }).rejects.toThrow(/Client not found for THOR chain/)
    })

    it('Should get tx url', async () => {
      expect(
        await wallet.getExplorerTxUrl('BTC', 'fb3e3f58b2e33eaeb1d1623087bc47183395c06699fce4c150066c7f7c700f68'),
      ).toBeDefined()
    })

    it('Should not get tx url from unknown client', async () => {
      await expect(async () => {
        await wallet.getExplorerTxUrl('THOR', 'A4A8EB504016E930C10C8E5A5AC2980F89FBE10CF2861D99524574B32E009EA3')
      }).rejects.toThrow(/Client not found for THOR chain/)
    })
  })

  describe('UTXO fees', () => {
    let btc: BtcClient
    let wallet: Wallet
    beforeEach(() => {
      btc = new BtcClient({ ...defaultBTCParams, network: Network.Mainnet })
      wallet = new Wallet({ BTC: btc })
    })

    it('Should round UTXO fee rates up', async () => {
      jest.spyOn(btc, 'getFeeRates').mockResolvedValue({ average: 1.4, fast: 2.2, fastest: 0.4 })
      const rates = await wallet.getFeeRates('BTC')
      expect(rates.average.amount().toNumber()).toBe(2)
      expect(rates.fast.amount().toNumber()).toBe(3)
      expect(rates.fastest.amount().toNumber()).toBe(1)
    })

    it('Should estimate transfer fees for the requested wallet index', async () => {
      const fees = { average: baseAmount(1), fast: baseAmount(2), fastest: baseAmount(3), type: FeeType.PerByte }
      const getAddressAsync = jest.spyOn(btc, 'getAddressAsync').mockResolvedValue('bc1qsender')
      const getFees = jest.spyOn(btc, 'getFees').mockResolvedValue(fees)
      const result = await wallet.estimateTransferFees({
        asset: AssetBTC,
        recipient: 'bc1qrecipient',
        amount: assetToBase(assetAmount(0.001, 8)),
        memo: 'memo',
        walletIndex: 3,
      })
      expect(getAddressAsync).toHaveBeenCalledWith(3)
      expect(getFees).toHaveBeenCalledWith({ sender: 'bc1qsender', memo: 'memo' })
      expect(result).toBe(fees)
    })

    it('Should not swallow address errors when estimating transfer fees', async () => {
      jest.spyOn(btc, 'getAddressAsync').mockRejectedValue(new Error('no address'))
      const getFees = jest.spyOn(btc, 'getFees')
      await expect(
        wallet.estimateTransferFees({
          asset: AssetBTC,
          recipient: 'bc1qrecipient',
          amount: assetToBase(assetAmount(0.001, 8)),
        }),
      ).rejects.toThrow('no address')
      expect(getFees).not.toHaveBeenCalled()
    })
  })
})
