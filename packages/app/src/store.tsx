import { throttle } from 'lodash-es'
import React, {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react'
import { fetchClients } from './api'

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
  logs: LogMessage[]
  list: ClientInstance[]
  addLog: (log: LogMessage) => void
  load: () => void
}

export const GlobalContext = createContext({
  logs: [],
  list: [],
  addLog: () => {},
  load: () => {},
} as StoreContext)

export const GlobalProvider = ({ children }: PropsWithChildren<any>) => {
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [list, setList] = useState([])

  const addLog = (log: LogMessage) => {
    setLogs((l) => [log, ...l].slice(0, 50))
  }

  const load = throttle(
    () => fetchClients().then((result) => setList(result)),
    500
  )

  return (
    <GlobalContext.Provider value={{ logs, addLog, list, load }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalProvider = () => useContext(GlobalContext)
