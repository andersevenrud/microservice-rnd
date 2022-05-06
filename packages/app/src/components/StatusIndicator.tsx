import React from 'react'
import { capitalize } from 'lodash-es'
import { classNames, statusClassNames } from '../utils'

const StatusIndicator = ({ status }: { status: string }) => (
  <div
    title={capitalize(status)}
    className={classNames('h-4 w-4 rounded-full', statusClassNames[status])}
  ></div>
)

export default StatusIndicator
