import ReconnectingWebSocket from 'reconnecting-websocket'
import React, { useEffect, useState } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faRotateRight,
  faPlus,
  faChevronUp,
  faChevronDown,
  faPlay,
  faStop,
  faBan,
} from '@fortawesome/free-solid-svg-icons'
import { capitalize } from 'lodash-es'
import { useGlobalProvider, ClientInstance } from '../store'
import { formattedTimestamp } from '../utils'
import {
  createClient,
  deleteClient,
  performClientAction,
} from '../services/api'
import Timestamp from '../components/Timestamp'
import Heading from '../components/Heading'
import StatusIndicator from '../components/StatusIndicator'
import Box from '../components/Box'
import Button from '../components/Button'
import config from '../config'

function useWebsocket() {
  let ws: ReconnectingWebSocket | undefined
  let settleTimeout: any
  const { load, addLog, addToast } = useGlobalProvider()

  const onMessage = (event: MessageEvent<any>) => {
    const data = JSON.parse(event.data)

    if (['clientState'].includes(data.topic)) {
      load()
    } else {
      addLog(data)
    }
  }

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
        message: `Closed failure ${ev.code} (${ev.reason || 'unknown reason'})`,
      })
    }
  }

  const onError = () => addToast({ type: 'error', message: 'Connection error' })

  const connect = () => {
    ws = new ReconnectingWebSocket(config.webSocketUrl)
    ws.addEventListener('open', onOpen)
    ws.addEventListener('close', onClose)
    ws.addEventListener('error', onError)
    ws.addEventListener('message', onMessage)
  }

  const disconnect = () => {
    if (ws) {
      ws.removeEventListener('open', onOpen)
      ws.removeEventListener('close', onClose)
      ws.removeEventListener('error', onError)
      ws.removeEventListener('message', onMessage)
      ws.close()
    }
  }

  return [connect, disconnect]
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
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
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
            <FontAwesomeIcon icon={faPlay} />
          </Button>
          <Button
            title="Stop"
            disabled={['stopping', 'stopped'].includes(item.state)}
            onClick={() => onClientAction(item, 'stop')}
          >
            <FontAwesomeIcon icon={faStop} />
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
            <FontAwesomeIcon icon={faRotateRight} />
          </Button>
          <Button
            title="Delete"
            disabled={!['started', 'stopped'].includes(item.state)}
            className="bg-red-400 text-white"
            onClick={() => onDeleteClient(item)}
          >
            <FontAwesomeIcon icon={faBan} />
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
          <FontAwesomeIcon icon={faRotateRight} />
          <span>Reload</span>
        </Button>
        <Button
          className="bg-blue-500 font-bold text-white"
          onClick={onCreateClient}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create</span>
        </Button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { load } = useGlobalProvider()
  const { keycloak, initialized } = useKeycloak()
  const [connect, disconnect] = useWebsocket()

  useEffect(() => {
    document.cookie = `${config.cookieName}=${keycloak.token}`
  }, [initialized])

  useEffect(() => {
    connect()
    load()

    return () => {
      disconnect()
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
