import ReconnectingWebSocket from 'reconnecting-websocket'
import { parse, formatDistance } from 'date-fns'
import React, {
  useState,
  useEffect,
  useRef,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from 'react'

type ClassName = string | string[] | undefined

interface ClientInstance {
  id: number
  uuid: string
  online: boolean
  state: string
  createdAt: string
  updatedAt: string
  lastActiveAt: string
}

const apiTimeFormat = 'yyyy-MM-dd HH:mm:ss'

const classNames = (...args: any[]) => args.filter(Boolean).flat().join(' ')

const now = () => new Date(new Date().toUTCString().slice(0, -4))

const distanced = (date: string | null) =>
  date
    ? formatDistance(parse(date, apiTimeFormat, new Date()), now(), {
        addSuffix: true,
      })
    : ''

const fetchClients = () =>
  fetch('/api/client').then((response) => response.json())

const createClient = () => fetch('/api/client', { method: 'POST' })

const deleteClient = (uuid: string) =>
  fetch(`/api/client/${uuid}`, { method: 'DELETE' })

const performClientAction = (uuid: string, action: string) =>
  fetch(`/api/client/${uuid}/${action}`, { method: 'POST' })

const Timestamp = ({ date }: { date: string }) => (
  <time title={date}>{distanced(date)}</time>
)

const Button = ({
  children,
  className,
  ...args
}: PropsWithChildren<ButtonHTMLAttributes<{ className?: ClassName }>>) => (
  <button
    className={classNames(
      'px-2 py-1 rounded',
      className || 'bg-gray-500 text-white',
      args.disabled && 'cursor-not-allowed opacity-50'
    )}
    {...args}
  >
    {children}
  </button>
)

export default function App() {
  const textbox = useRef<HTMLTextAreaElement | null>(null)
  const [list, setList] = useState<ClientInstance[]>([])

  const load = () => fetchClients().then((result) => setList(result))

  const onCreateClient = () => createClient()

  const onDeleteClient = (client: ClientInstance) => deleteClient(client.uuid)

  const onClientAction = (client: ClientInstance, action: string) =>
    performClientAction(client.uuid, action)

  const processMessage = async (data: Blob) => {
    const str = await new Response(data).text()
    const { level, message, ...extra } = JSON.parse(str)

    if (textbox.current) {
      const msg = `[${level}] ${message} ${JSON.stringify(extra)}\n`
      textbox.current.value = msg + textbox.current.value
    }
  }

  useEffect(() => {
    const interval = setInterval(() => load(), 1000 * 100)
    load()

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/logs/'
    )

    ws.addEventListener('message', (event) => {
      processMessage(event.data)
    })

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="p-2 space-y-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold flex-grow">Clients</h1>

        <div>
          <Button className="text-white bg-blue-500" onClick={onCreateClient}>
            Create new client
          </Button>
        </div>
      </div>

      <table className="w-full table-fixed">
        <thead>
          <tr className="text-left">
            <th className="w-10">ID</th>
            <th>UUID</th>
            <th>Created</th>
            <th>Last active</th>
            <th>State</th>
            <th>Online</th>
            <th>&nbsp;</th>
          </tr>
        </thead>

        <tbody>
          {list.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.uuid}</td>
              <td>
                <Timestamp date={item.createdAt} />
              </td>
              <td>
                <Timestamp date={item.lastActiveAt} />
              </td>
              <td>{item.state}</td>
              <td>{item.online ? 'Yes' : 'No'}</td>
              <td>
                <div className="flex space-x-1 justify-end">
                  <Button
                    disabled={[
                      'starting',
                      'started',
                      'restarting',
                      'stopping',
                    ].includes(item.state)}
                    onClick={() => onClientAction(item, 'start')}
                  >
                    Start
                  </Button>
                  <Button
                    disabled={['stopping', 'stopped'].includes(item.state)}
                    onClick={() => onClientAction(item, 'stop')}
                  >
                    Stop
                  </Button>
                  <Button
                    disabled={[
                      'stopping',
                      'restarting',
                      'starting',
                      'stopped',
                    ].includes(item.state)}
                    onClick={() => onClientAction(item, 'restart')}
                  >
                    Restart
                  </Button>
                  <Button
                    disabled={!['started', 'stopped'].includes(item.state)}
                    onClick={() => onDeleteClient(item)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <textarea
          ref={textbox}
          className="block w-full bg-black text-white p-2 h-96"
        ></textarea>
      </div>
    </div>
  )
}
