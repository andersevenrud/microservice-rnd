import React from 'react'
import { useGlobalProvider, ToastMessage } from '../store'
import {
  classNames,
  statusClassNames,
  statusForegroundClassNames,
} from '../utils'

export default function Toasts() {
  const { toasts } = useGlobalProvider()

  const createClassNames = (toast: ToastMessage) =>
    classNames(
      'p-3 rounded',
      statusClassNames[toast.type],
      statusForegroundClassNames[toast.type]
    )

  return (
    <div className="fixed right-0 bottom-0 z-50 m-2 space-y-4">
      {toasts.map((toast, i) => (
        <div key={i} className={createClassNames(toast)}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
