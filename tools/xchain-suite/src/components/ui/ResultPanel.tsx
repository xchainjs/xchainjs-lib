import { ReactNode } from 'react'

interface ResultPanelProps {
  loading: boolean
  error: Error | null
  duration: number | null
  children: ReactNode
}

export function ResultPanel({
  loading,
  error,
  duration,
  children,
}: ResultPanelProps) {
  if (!loading && !error && !children) {
    return null
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Result</h4>
        {duration !== null && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(duration)}ms</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Executing operation...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1 break-all">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && children && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium text-green-800 dark:text-green-300">Success</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-md p-3">{children}</div>
        </div>
      )}
    </div>
  )
}
