import React, { PropsWithChildren, ButtonHTMLAttributes } from 'react'
import { classNames, ClassName } from '../utils'

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

export default Button
