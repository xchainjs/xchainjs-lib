import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WalletProvider, useWallet } from './WalletContext'

const TEST_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

function TestComponent() {
  const { isConnected, connect, disconnect } = useWallet()
  return (
    <div>
      <span data-testid="status">{isConnected ? 'connected' : 'disconnected'}</span>
      <button onClick={() => connect(TEST_PHRASE)}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  )
}

describe('WalletContext', () => {
  it('should start disconnected', () => {
    render(<WalletProvider><TestComponent /></WalletProvider>)
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected')
  })

  it('should connect with valid phrase', () => {
    render(<WalletProvider><TestComponent /></WalletProvider>)
    fireEvent.click(screen.getByText('Connect'))
    expect(screen.getByTestId('status')).toHaveTextContent('connected')
  })

  it('should disconnect', () => {
    render(<WalletProvider><TestComponent /></WalletProvider>)
    fireEvent.click(screen.getByText('Connect'))
    fireEvent.click(screen.getByText('Disconnect'))
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected')
  })
})
