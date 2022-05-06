import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://auth.rnd.lvh.me/',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'rnd',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'rnd-client',
})

export default keycloak
