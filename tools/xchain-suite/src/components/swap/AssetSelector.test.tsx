import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AssetSelector } from './AssetSelector'

describe('AssetSelector', () => {
  it('lists Zcash when the swap chain list includes ZEC', () => {
    const onChange = vi.fn()
    render(<AssetSelector label="From" value={null} onChange={onChange} availableChains={['BTC', 'ZEC']} />)

    fireEvent.click(screen.getByText('Select asset...'))
    fireEvent.change(screen.getByPlaceholderText('Search by name or symbol...'), { target: { value: 'zec' } })
    fireEvent.click(screen.getByText('Zcash'))

    expect(onChange).toHaveBeenCalledWith({ chainId: 'ZEC', chainName: 'Zcash', symbol: 'ZEC' })
  })

  it('lists Base ETH and Ripple when those chains are swappable', () => {
    const onChange = vi.fn()
    render(<AssetSelector label="From" value={null} onChange={onChange} availableChains={['BASE', 'XRP']} />)

    fireEvent.click(screen.getByText('Select asset...'))
    fireEvent.change(screen.getByPlaceholderText('Search by name or symbol...'), { target: { value: 'base' } })
    fireEvent.click(screen.getAllByText('Base')[0])

    expect(onChange).toHaveBeenCalledWith({ chainId: 'BASE', chainName: 'Base', symbol: 'ETH' })

    fireEvent.click(screen.getByText('Select asset...'))
    fireEvent.change(screen.getByPlaceholderText('Search by name or symbol...'), { target: { value: 'xrp' } })
    fireEvent.click(screen.getByText('Ripple'))

    expect(onChange).toHaveBeenLastCalledWith({ chainId: 'XRP', chainName: 'Ripple', symbol: 'XRP' })
  })

  it('hides Zcash when ZEC is not a swap chain', () => {
    render(<AssetSelector label="From" value={null} onChange={vi.fn()} availableChains={['BTC']} />)

    fireEvent.click(screen.getByText('Select asset...'))
    fireEvent.change(screen.getByPlaceholderText('Search by name or symbol...'), { target: { value: 'zec' } })

    expect(screen.queryByText('Zcash')).not.toBeInTheDocument()
  })
})
