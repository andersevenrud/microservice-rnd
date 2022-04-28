import ReconnectingWebSocket from 'reconnecting-websocket'
import { capitalize } from 'lodash-es'
import { parse, formatDistance } from 'date-fns'
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
  <h2 className="text-3xl py-4">{children}</h2>
)

const StatusIndicator = ({ status }: { status: string }) => (
  <div
    title={capitalize(status)}
    className={classNames('w-4 h-4 rounded-full', statusClassNames[status])}
  ></div>
)

const Box = ({ children }: PropsWithChildren<any>) => (
  <div className="bg-white shadow rounded p-4">{children}</div>
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
      'px-4 py-2 rounded-md',
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
    <div className="fixed bottom-0 right-0 z-50 m-2 space-y-4">
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
            <div className="flex items-center border-b border-gray-200 pb-4 space-x-4">
              <span className="flex-grow">{formattedTimestamp(timestamp)}</span>
              <StatusIndicator status={data.level} />
            </div>
            <div className="pt-4 space-y-2">
              <div className="mb-4">{data.message}</div>
              <div className="p-4 text-sm bg-gray-100 text-gray-500 overflow-auto">
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

  const onToggle = () => setExpanded(!expanded)

  const onDeleteClient = (client: ClientInstance) =>
    deleteClient(client.uuid)
      .then(() => load())
      .then(() => addToast({ type: 'info', message: 'Deleting client' }))
      .catch(() =>
        addToast({ type: 'error', message: 'Failed to delete client' })
      )

  const onClientAction = (client: ClientInstance, action: string) =>
    performClientAction(client.uuid, action)
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
          className="flex items-center space-x-2 text-lg text-gray-800 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center text-gray-500 text-xs">
            <i
              className={classNames(
                'fa',
                `fa-chevron-${expanded ? 'up' : 'down'}`
              )}
            />
          </div>
          <div className="flex-grow">
            <span>{item.uuid}</span>
          </div>
          <div>
            <StatusIndicator status={item.online ? 'success' : 'error'} />
          </div>
        </div>

        {expanded && (
          <div className="text-sm text-gray-500 space-y-2 mt-4">
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
        <div className="flex flex-grow space-x-2 justify-end">
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
    <div className="grid md:grid-cols-2 gap-4 items-baseline">
      {list.map((item) => (
        <ListBox key={item.uuid} item={item} />
      ))}
    </div>
  )
}

function Actions() {
  const { load, addToast } = useGlobalProvider()

  const onCreateClient = () =>
    createClient()
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
          className="text-white bg-blue-500 font-bold"
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

  const onMessage = (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data)

    if (['clientState'].includes(data.topic)) {
      load()
    } else {
      addLog(data)
    }
  }

  useEffect(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/logs/'
    )

    const onOpen = () => addToast({ type: 'info', message: 'Connected' })

    const onClose = () =>
      addToast({ type: 'warning', message: 'Closed connection' })

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

export default function App() {
  return (
    <GlobalProvider>
      <div className="bg-gray-100 max-w-screen min-h-screen">
        <div className="sticky top-0 left-0 right-0 bg-white p-4 border-b border-gray-200 shadow-sm">
          <h1 className="text-xl">Kafkaesque</h1>
        </div>

        <div className="py-8 max-w-7xl mx-auto px-2 7xl:px-0">
          <Page />
        </div>

        <div className="text-gray-400 text-xs text-center p-8">
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
    </GlobalProvider>
  )
}
