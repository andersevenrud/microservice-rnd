import React, { PropsWithChildren } from 'react'

const Heading = ({ children }: PropsWithChildren<any>) => (
  <h2 className="py-4 text-3xl">{children}</h2>
)

export default Heading
