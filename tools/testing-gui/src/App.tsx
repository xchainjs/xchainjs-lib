import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { Layout } from './components/layout/Layout'
import { ChainPage } from './pages/ChainPage'

export default function App() {
  return (
    <WalletProvider>
      <ConfigProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/chain/BTC" replace />} />
              <Route path="/chain/:chainId" element={<ChainPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </WalletProvider>
  )
}
