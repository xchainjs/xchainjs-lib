import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { Layout } from './components/layout/Layout'
import { ChainPage } from './pages/ChainPage'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load pages to avoid loading dependencies on initial load
const SwapPage = lazy(() => import('./pages/SwapPage'))
const LiquidityPage = lazy(() => import('./pages/LiquidityPage'))
const THORNodePage = lazy(() => import('./pages/THORNodePage'))

function SwapPageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading swap interface...</p>
      </div>
    </div>
  )
}

function LiquidityPageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading liquidity interface...</p>
      </div>
    </div>
  )
}

function THORNodePageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading THORNode interface...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <ConfigProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/chain/BTC" replace />} />
                <Route
                  path="/swap"
                  element={
                    <Suspense fallback={<SwapPageLoader />}>
                      <SwapPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/liquidity"
                  element={
                    <Suspense fallback={<LiquidityPageLoader />}>
                      <LiquidityPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/thornode"
                  element={
                    <Suspense fallback={<THORNodePageLoader />}>
                      <THORNodePage />
                    </Suspense>
                  }
                />
                <Route path="/chain/:chainId" element={<ChainPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </WalletProvider>
    </ErrorBoundary>
  )
}
