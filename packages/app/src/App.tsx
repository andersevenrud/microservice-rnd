import ReconnectingWebSocket from 'reconnecting-websocket'
import { capitalize } from 'lodash-es'
import { parse, formatDistance } from 'date-fns'
import React, {
  useEffect,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react'
import { GlobalProvider, useGlobalProvider, ClientInstance } from './store'
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
    title={status ? 'online' : 'offline'}
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
              <div className="p-2 text-sm bg-gray-100 text-gray-500">
                <pre>{JSON.stringify(data.meta)}</pre>
              </div>
            </div>
          </div>
        </Box>
      ))}
    </div>
  )
}

function List() {
  const { list, load } = useGlobalProvider()

  const onDeleteClient = (client: ClientInstance) =>
    deleteClient(client.uuid).then(() => load())

  const onClientAction = (client: ClientInstance, action: string) =>
    performClientAction(client.uuid, action).then(() => load())

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {list.map((item) => (
        <Box key={item.id}>
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center text-lg text-gray-800">
              <div className="flex-grow">
                <span>{item.uuid}</span>
              </div>
              <div>
                <StatusIndicator status={item.online ? 'success' : 'error'} />
              </div>
            </div>

            <div className="text-sm text-gray-500 leading-6">
              <div>
                Active <Timestamp date={item.lastActiveAt} />
              </div>
              <div>
                Created <Timestamp date={item.createdAt} />
              </div>
            </div>
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
      ))}
    </div>
  )
}

function Page() {
  const { load, addLog } = useGlobalProvider()

  const onCreateClient = () => createClient().then(() => load())

  const processMessage = (raw: string) => {
    const data = JSON.parse(raw)

    if (['clientAction', 'clientMessage'].includes(data.topic)) {
      load()
    } else {
      addLog(data)
    }
  }

  useEffect(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/logs/'
    )

    ws.addEventListener('message', (event) => {
      processMessage(event.data)
    })

    load()

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="p-2 space-y-4">
      <div className="flex items-center">
        <div className="flex-grow">
          <Heading>Clients</Heading>
        </div>

        <div>
          <Button
            className="text-white bg-blue-500 font-bold"
            onClick={onCreateClient}
          >
            <i className="fa fa-plus" />
            <span>Create new client</span>
          </Button>
        </div>
      </div>

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
        <div className="py-8 max-w-7xl mx-auto">
          <Page />
        </div>
      </div>
    </GlobalProvider>
  )
}
