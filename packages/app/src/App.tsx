import React, { PropsWithChildren } from 'react'
import { useKeycloak, ReactKeycloakProvider } from '@react-keycloak/web'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GlobalProvider } from './store'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import LoginPage from './pages/Login'
import LogoutPage from './pages/Logout'
import client from './keycloak'

function ProtectedRoute({ children }: PropsWithChildren<any>) {
  const { keycloak } = useKeycloak()

  if (keycloak.authenticated) {
    return children
  }

  return <Navigate to="/login" />
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ReactKeycloakProvider authClient={client}>
      <GlobalProvider>
        <Router />
      </GlobalProvider>
    </ReactKeycloakProvider>
  )
}
