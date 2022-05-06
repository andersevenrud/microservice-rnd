import React from 'react'
import { Outlet } from 'react-router-dom'
import Toasts from './Toasts'

export default function Layout() {
  return (
    <div className="max-w-screen min-h-screen bg-gray-100">
      <div className="sticky inset-x-0 top-0 border-b border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl">Kafkaesque</h1>
      </div>

      <div className="7xl:px-0 mx-auto max-w-7xl py-8 px-2">
        <Outlet />
      </div>

      <div className="p-8 text-center text-xs text-gray-400">
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
  )
}
