import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ValidateAddress } from './ValidateAddress'

describe('ValidateAddress', () => {
  it('should render input', () => {
    const mockClient = { validateAddress: vi.fn(() => true) }
    render(<ValidateAddress chainId="BTC" client={mockClient as any} />)

    expect(screen.getByPlaceholderText(/address/i)).toBeInTheDocument()
    expect(screen.getByText('Validate Address')).toBeInTheDocument()
  })

  it('should auto-validate address on input change', async () => {
    const mockClient = { validateAddress: vi.fn(() => true) }
    render(<ValidateAddress chainId="BTC" client={mockClient as any} />)

    fireEvent.change(screen.getByPlaceholderText(/address/i), { target: { value: 'bc1test' } })

    // Wait for debounced validation (300ms + some buffer)
    await waitFor(() => {
      expect(mockClient.validateAddress).toHaveBeenCalledWith('bc1test')
    }, { timeout: 500 })
  })
})
