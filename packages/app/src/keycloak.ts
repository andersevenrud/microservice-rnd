import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.KEYCLOAK_URL || 'http://localhost:8081/',
  realm: import.meta.env.KEYCLOAK_REALM || 'rnd',
  clientId: import.meta.env.KEYCLOAK_CLIENT_ID || 'rnd-client',
})

export default keycloak
