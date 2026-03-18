import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { Layout } from './components/layout/Layout'
import { ChainPage } from './pages/ChainPage'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load pages to avoid loading dependencies on initial load
const SwapPage = lazy(() => import('./pages/SwapPage'))
const RecurringSwapPage = lazy(() => import('./pages/RecurringSwapPage'))
const PoolsPage = lazy(() => import('./pages/PoolsPage'))
const LiquidityPage = lazy(() => import('./pages/LiquidityPage'))
const TradeAssetsPage = lazy(() => import('./pages/TradeAssetsPage'))
const RunePoolPage = lazy(() => import('./pages/RunePoolPage'))
const THORNodePage = lazy(() => import('./pages/THORNodePage'))
const MAYANodePage = lazy(() => import('./pages/MAYANodePage'))
const MAYANamePage = lazy(() => import('./pages/MAYANamePage'))
const THORNamePage = lazy(() => import('./pages/THORNamePage'))
const RouterApprovalPage = lazy(() => import('./pages/RouterApprovalPage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const TradePage = lazy(() => import('./pages/TradePage'))

function PageLoader({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
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
                <Route index element={<Navigate to="/portfolio" replace />} />
                <Route
                  path="/portfolio"
                  element={
                    <Suspense fallback={<PageLoader message="Loading portfolio..." />}>
                      <PortfolioPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/swap"
                  element={
                    <Suspense fallback={<PageLoader message="Loading swap interface..." />}>
                      <SwapPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/recurring"
                  element={
                    <Suspense fallback={<PageLoader message="Loading recurring swaps..." />}>
                      <RecurringSwapPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/pools"
                  element={
                    <Suspense fallback={<PageLoader message="Loading pools..." />}>
                      <PoolsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/liquidity"
                  element={
                    <Suspense fallback={<PageLoader message="Loading liquidity interface..." />}>
                      <LiquidityPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/trade-assets"
                  element={
                    <Suspense fallback={<PageLoader message="Loading trade assets..." />}>
                      <TradeAssetsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/runepool"
                  element={
                    <Suspense fallback={<PageLoader message="Loading RUNEPool..." />}>
                      <RunePoolPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/thornode"
                  element={
                    <Suspense fallback={<PageLoader message="Loading THORNode..." />}>
                      <THORNodePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/mayanode"
                  element={
                    <Suspense fallback={<PageLoader message="Loading MAYANode..." />}>
                      <MAYANodePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/mayaname"
                  element={
                    <Suspense fallback={<PageLoader message="Loading MAYAName..." />}>
                      <MAYANamePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/thorname"
                  element={
                    <Suspense fallback={<PageLoader message="Loading THORName..." />}>
                      <THORNamePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/router-approval"
                  element={
                    <Suspense fallback={<PageLoader message="Loading router approval..." />}>
                      <RouterApprovalPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/trade"
                  element={
                    <Suspense fallback={<PageLoader message="Loading trade charts..." />}>
                      <TradePage />
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
