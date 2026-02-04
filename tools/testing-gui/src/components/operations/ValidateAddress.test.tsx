import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ValidateAddress } from './ValidateAddress'

describe('ValidateAddress', () => {
  it('should render input and button', () => {
    const mockClient = { validateAddress: vi.fn(() => true) }
    render(<ValidateAddress client={mockClient as any} />)

    expect(screen.getByPlaceholderText(/address/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should call validateAddress on submit', () => {
    const mockClient = { validateAddress: vi.fn(() => true) }
    render(<ValidateAddress client={mockClient as any} />)

    fireEvent.change(screen.getByPlaceholderText(/address/i), { target: { value: 'bc1test' } })
    fireEvent.click(screen.getByRole('button'))

    expect(mockClient.validateAddress).toHaveBeenCalledWith('bc1test')
  })
})
