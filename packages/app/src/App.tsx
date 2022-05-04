import ReconnectingWebSocket from 'reconnecting-websocket'
import { useKeycloak, ReactKeycloakProvider } from '@react-keycloak/web'
import { capitalize } from 'lodash-es'
import { parse, formatDistance } from 'date-fns'
import {
  useNavigate,
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import React, {
  useEffect,
  useState,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react'
import {
  GlobalProvider,
  useGlobalProvider,
  ClientInstance,
  ToastMessage,
} from './store'
import { createClient, deleteClient, performClientAction } from './api'
import keycloak from './keycloak'

type ClassName = string | string[] | undefined

const apiTimeFormat = 'yyyy-MM-dd HH:mm:ss'

const statusClassNames: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warn: 'bg-orange-500',
  error: 'bg-red-500',
  debug: 'bg-gray-500',
}

const statusForegroundClassNames: Record<string, string> = {
  success: 'text-white',
  info: 'text-white',
  warn: 'text-black',
  error: 'text-white',
  debug: 'text-black',
}

const classNames = (...args: any[]) => args.filter(Boolean).flat().join(' ')

const now = () => new Date(new Date().toUTCString().slice(0, -4))

const formattedTimestamp = (timestamp: string | number) =>
  parse(String(timestamp), 'T', new Date()).toISOString()

const distanced = (date: string | null) =>
  date
    ? formatDistance(parse(date, apiTimeFormat, new Date()), now(), {
        addSuffix: true,
      })
    : ''

const Timestamp = ({ date }: { date: string }) => (
  <time title={date}>{distanced(date)}</time>
)

const Heading = ({ children }: PropsWithChildren<any>) => (
  <h2 className="py-4 text-3xl">{children}</h2>
)

const StatusIndicator = ({ status }: { status: string }) => (
  <div
    title={capitalize(status)}
    className={classNames('h-4 w-4 rounded-full', statusClassNames[status])}
  ></div>
)

const Box = ({ children }: PropsWithChildren<any>) => (
  <div className="rounded bg-white p-4 shadow">{children}</div>
)

const Button = ({
  children,
  className,
  title,
  ...args
}: PropsWithChildren<
  ButtonHTMLAttributes<{ className?: ClassName; title?: string }>
>) => (
  <button
    title={title}
    className={classNames(
      'inline-flex items-center space-x-2',
      'rounded-md px-4 py-2',
      className || 'border border-gray-200 text-gray-600',
      args.disabled && 'cursor-not-allowed opacity-30'
    )}
    {...args}
  >
    {children}
  </button>
)

function Toasts() {
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

function Logs() {
  const { logs } = useGlobalProvider()

  return (
    <div className="space-y-4">
      {logs.map(({ timestamp, data }, i) => (
        <Box key={i}>
          <div>
            <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
              <span className="grow">{formattedTimestamp(timestamp)}</span>
              <StatusIndicator status={data.level} />
            </div>
            <div className="space-y-2 pt-4">
              <div className="mb-4">{data.message}</div>
              <div className="overflow-auto bg-gray-100 p-4 text-sm text-gray-500">
                <pre>{JSON.stringify(data.meta, null, 4)}</pre>
              </div>
            </div>
          </div>
        </Box>
      ))}
    </div>
  )
}

function ListBox({ item }: { item: ClientInstance }) {
  const [expanded, setExpanded] = useState(false)
  const { load, addToast } = useGlobalProvider()
  const { keycloak } = useKeycloak()

  const onToggle = () => setExpanded(!expanded)

  const onDeleteClient = (client: ClientInstance) =>
    deleteClient(client.uuid, keycloak.token)
      .then(() => load())
      .then(() => addToast({ type: 'info', message: 'Deleting client' }))
      .catch(() =>
        addToast({ type: 'error', message: 'Failed to delete client' })
      )

  const onClientAction = (client: ClientInstance, action: string) =>
    performClientAction(client.uuid, action, keycloak.token)
      .then(() => load())
      .then(() =>
        addToast({ type: 'info', message: `Performing "${action}" on client` })
      )
      .catch(() =>
        addToast({ type: 'error', message: 'Failed to perform client action' })
      )

  return (
    <Box>
      <div className="border-b border-gray-200 pb-4">
        <div
          className="flex cursor-pointer items-center space-x-2 text-lg text-gray-800"
          onClick={onToggle}
        >
          <div className="flex items-center text-xs text-gray-500">
            <i
              className={classNames(
                'fa',
                `fa-chevron-${expanded ? 'up' : 'down'}`
              )}
            />
          </div>
          <div className="grow">
            <span>{item.uuid}</span>
          </div>
          <div>
            <StatusIndicator status={item.online ? 'success' : 'error'} />
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div>
              Active <Timestamp date={item.lastActiveAt} />
            </div>
            <div>
              Created <Timestamp date={item.createdAt} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <div>{capitalize(item.state)}</div>
        <div className="flex grow justify-end space-x-2">
          <Button
            title="Start"
            disabled={[
              'starting',
              'started',
              'restarting',
              'stopping',
            ].includes(item.state)}
            onClick={() => onClientAction(item, 'start')}
          >
            <i className="fa fa-play" />
          </Button>
          <Button
            title="Stop"
            disabled={['stopping', 'stopped'].includes(item.state)}
            onClick={() => onClientAction(item, 'stop')}
          >
            <i className="fa fa-stop" />
          </Button>
          <Button
            title="Restart"
            disabled={[
              'stopping',
              'restarting',
              'starting',
              'stopped',
            ].includes(item.state)}
            onClick={() => onClientAction(item, 'restart')}
          >
            <i className="fa fa-rotate-right" />
          </Button>
          <Button
            title="Delete"
            disabled={!['started', 'stopped'].includes(item.state)}
            className="bg-red-400 text-white"
            onClick={() => onDeleteClient(item)}
          >
            <i className="fa fa-ban" />
          </Button>
        </div>
      </div>
    </Box>
  )
}

function List() {
  const { list } = useGlobalProvider()

  return (
    <div className="grid items-baseline gap-4 md:grid-cols-2">
      {list.map((item) => (
        <ListBox key={item.uuid} item={item} />
      ))}
    </div>
  )
}

function Actions() {
  const { load, addToast } = useGlobalProvider()
  const { keycloak } = useKeycloak()

  const onCreateClient = () =>
    createClient(keycloak.token)
      .then(() => load())
      .then(() => addToast({ type: 'info', message: 'Creating client' }))
      .catch(() => addToast({ type: 'error', message: 'Failed to add client' }))

  const onReload = () => load()

  return (
    <div className="flex justify-end">
      <div className="space-x-4">
        <Button className="bg-white" onClick={onReload}>
          <i className="fa fa-rotate-right" />
          <span>Reload</span>
        </Button>
        <Button
          className="bg-blue-500 font-bold text-white"
          onClick={onCreateClient}
        >
          <i className="fa fa-plus" />
          <span>Create</span>
        </Button>
      </div>
    </div>
  )
}

function Page() {
  const { load, addLog, addToast } = useGlobalProvider()
  const { initialized } = useKeycloak()

  const onMessage = (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data)

    if (['clientState'].includes(data.topic)) {
      load()
    } else {
      addLog(data)
    }
  }

  useEffect(() => {
    document.cookie = `rnd_token=${keycloak.token}`
  }, [initialized])

  useEffect(() => {
    let settleTimeout = -1

    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/logs/'
    )

    const onOpen = () => {
      clearTimeout(settleTimeout)

      settleTimeout = setTimeout(() => {
        addToast({ type: 'info', message: 'Connected' })
        load()
      }, 500)
    }

    const onClose = (ev: any) => {
      clearTimeout(settleTimeout)

      if (ev.code === 1000) {
        addToast({ type: 'warning', message: 'Closed connection' })
      } else {
        addToast({
          type: 'error',
          message: `Closed failure ${ev.code} (${
            ev.reason || 'unknown reason'
          })`,
        })
      }
    }

    const onError = () =>
      addToast({ type: 'error', message: 'Connection error' })

    ws.addEventListener('open', onOpen)
    ws.addEventListener('close', onClose)
    ws.addEventListener('error', onError)
    ws.addEventListener('message', onMessage)

    load()

    return () => {
      ws.removeEventListener('open', onOpen)
      ws.removeEventListener('close', onClose)
      ws.removeEventListener('error', onError)
      ws.removeEventListener('message', onMessage)
      ws.close()
    }
  }, [])

  return (
    <div className="space-y-4">
      <Actions />
      <Heading>Clients</Heading>
      <List />
      <Heading>Latest logs</Heading>
      <Logs />
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const { keycloak, initialized } = useKeycloak()

  useEffect(() => {
    if (initialized) {
      if (!keycloak.authenticated) {
        keycloak.login()
      } else {
        navigate('/')
      }
    }
  }, [initialized])

  return <div>Redirecting...</div>
}

function LogoutPage() {
  const navigate = useNavigate()
  const { keycloak, initialized } = useKeycloak()

  useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        keycloak.logout()
      } else {
        navigate('/')
      }
    }
  }, [initialized])

  return <div>Redirecting...</div>
}

function Layout() {
  return (
    <div className="max-w-screen min-h-screen bg-gray-100">
      <div className="sticky inset-x-0 top-0 border-b border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl">Kafkaesque</h1>
        <button onClick={() => console.log(keycloak)}>Dump</button>
      </div>

      <div className="7xl:px-0 mx-auto max-w-7xl py-8 px-2">
        <Outlet />
      </div>

      <div className="p-8 text-center text-xs text-gray-400">
        <a
          href="https://github.com/andersevenrud/rnd-microservice-arch"
          target="_blank"
          rel="noreferrer"
        >
          A research project by Anders Evenrud
        </a>
      </div>

      <Toasts />
    </div>
  )
}

function ProtectedRoute({ children }: PropsWithChildren<any>) {
  const { keycloak } = useKeycloak()

  if (keycloak.authenticated) {
    return children
  }

  return <Navigate to="/login" />
}

export default function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Page />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </ReactKeycloakProvider>
  )
}
