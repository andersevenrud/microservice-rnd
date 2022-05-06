import React, { useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const { keycloak, initialized } = useKeycloak()

  useEffect(() => {
    if (initialized) {
      if (!keycloak.authenticated) {
        keycloak.login()
      } else {
        navigate('/')
      }
    }
  }, [initialized])

  return <div>Redirecting...</div>
}
