import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'

interface Props {
  asset: string
}

export function QuickTradePanel({ asset }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/swap', { state: { fromAsset: asset } })}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      <ArrowRightLeft className="w-4 h-4" />
      Trade {asset} on Swap
    </button>
  )
}
