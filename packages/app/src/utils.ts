import { parse, formatDistance } from 'date-fns'

export type ClassName = string | string[] | undefined

export const apiTimeFormat = 'yyyy-MM-dd HH:mm:ss'

export const statusClassNames: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warn: 'bg-orange-500',
  error: 'bg-red-500',
  debug: 'bg-gray-500',
}

export const statusForegroundClassNames: Record<string, string> = {
  success: 'text-white',
  info: 'text-white',
  warn: 'text-black',
  error: 'text-white',
  debug: 'text-black',
}

export const classNames = (...args: any[]) =>
  args.filter(Boolean).flat().join(' ')

export const now = () => new Date(new Date().toUTCString().slice(0, -4))

export const formattedTimestamp = (timestamp: string | number) =>
  parse(String(timestamp), 'T', new Date()).toISOString()

export const distanced = (date: string | null) =>
  date
    ? formatDistance(parse(date, apiTimeFormat, new Date()), now(), {
        addSuffix: true,
      })
    : ''
