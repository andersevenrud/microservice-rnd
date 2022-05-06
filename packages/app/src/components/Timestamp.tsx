import React from 'react'
import { distanced } from '../utils'

const Timestamp = ({ date }: { date: string }) => (
  <time title={date}>{distanced(date)}</time>
)

export default Timestamp
