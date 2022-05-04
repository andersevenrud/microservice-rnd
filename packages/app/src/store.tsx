import { throttle } from 'lodash-es'
import { useKeycloak } from '@react-keycloak/web'
import React, {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react'
import { fetchClients } from './api'

export type ToastMessageType = 'info' | 'warning' | 'error'

export interface ToastMessage {
  type: ToastMessageType
  message: string
}

export interface LogMessage {
  topic: string
  timestamp: number
  data: {
    level: string
    message: string
    meta: any
  }
}

export interface ClientInstance {
  id: number
  uuid: string
  online: boolean
  state: string
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

interface StoreContext {
  toasts: ToastMessage[]
  logs: LogMessage[]
  list: ClientInstance[]
  addLog: (log: LogMessage) => void
  addToast: (toast: ToastMessage) => void
  load: () => void
}

export const GlobalContext = createContext({
  toasts: [],
  logs: [],
  list: [],
  addLog: () => {},
  addToast: () => {},
  load: () => {},
} as StoreContext)

export const GlobalProvider = ({ children }: PropsWithChildren<any>) => {
  const { keycloak } = useKeycloak()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [list, setList] = useState([])

  const addToast = (message: ToastMessage) => {
    setToasts((l) => [message, ...l].slice(0, 5))
    setTimeout(() => setToasts(toasts.slice(0, -1)), 2000)
  }

  const addLog = (log: LogMessage) => {
    setLogs((l) => [log, ...l].slice(0, 50))
  }

  const load = throttle(
    () =>
      fetchClients(keycloak.token)
        .then((result) => setList(result))
        .catch((e) => addToast({ type: 'error', message: e.message })),
    500,
    { leading: false, trailing: true }
  )

  return (
    <GlobalContext.Provider
      value={{ logs, toasts, addLog, addToast, list, load }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalProvider = () => useContext(GlobalContext)
