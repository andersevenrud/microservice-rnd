import './style.css'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import App from './App'

const app = document.querySelector<HTMLDivElement>('#app')
if (app) {
  const root = createRoot(app)
  root.render(createElement(App))
}
