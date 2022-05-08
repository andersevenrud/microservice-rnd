export default {
  cookieName: 'rnd_token',

  webSocketUrl: window.location.origin.replace(/^http/, 'ws') + '/api/logs/',

  keycloak: {
    url:
      import.meta.env.VITE_KEYCLOAK_URL ||
      `https://auth.${window.location.hostname}/`,
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'rnd',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'rnd-client',
  },
}
