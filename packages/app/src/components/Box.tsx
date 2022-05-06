import React, { PropsWithChildren } from 'react'

const Box = ({ children }: PropsWithChildren<any>) => (
  <div className="rounded bg-white p-4 shadow">{children}</div>
)

export default Box
