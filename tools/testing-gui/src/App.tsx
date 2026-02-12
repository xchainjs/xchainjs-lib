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
const TradeAssetsPage = lazy(() => import('./pages/TradeAssetsPage'))
const RunePoolPage = lazy(() => import('./pages/RunePoolPage'))
const THORNodePage = lazy(() => import('./pages/THORNodePage'))
const MAYANodePage = lazy(() => import('./pages/MAYANodePage'))
const MAYANamePage = lazy(() => import('./pages/MAYANamePage'))
const RouterApprovalPage = lazy(() => import('./pages/RouterApprovalPage'))

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

function TradeAssetsPageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading trade assets interface...</p>
      </div>
    </div>
  )
}

function RunePoolPageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading RUNEPool interface...</p>
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

function MAYANodePageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading MAYANode interface...</p>
      </div>
    </div>
  )
}

function MAYANamePageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading MAYAName interface...</p>
      </div>
    </div>
  )
}

function RouterApprovalPageLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading router approval interface...</p>
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
                  path="/trade-assets"
                  element={
                    <Suspense fallback={<TradeAssetsPageLoader />}>
                      <TradeAssetsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/runepool"
                  element={
                    <Suspense fallback={<RunePoolPageLoader />}>
                      <RunePoolPage />
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
                <Route
                  path="/mayanode"
                  element={
                    <Suspense fallback={<MAYANodePageLoader />}>
                      <MAYANodePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/mayaname"
                  element={
                    <Suspense fallback={<MAYANamePageLoader />}>
                      <MAYANamePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/router-approval"
                  element={
                    <Suspense fallback={<RouterApprovalPageLoader />}>
                      <RouterApprovalPage />
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
