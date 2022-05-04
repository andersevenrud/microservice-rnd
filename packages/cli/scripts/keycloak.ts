import waitOn from 'wait-on'
import KcAdminClient from '@keycloak/keycloak-admin-client'
import config from '../src/config'

async function createRealm(admin: KcAdminClient, id: string) {
  const realms = await admin.realms.find()
  const found = realms.find((r) => r.realm === id)

  if (found) return

  await admin.realms.create({
    realm: id,
    displayName: 'Microservice RND',
    enabled: true,
  })
}

async function createApiClient(admin: KcAdminClient) {
  const clients = await admin.clients.find()
  const found = clients.find((c) => c.clientId === 'rnd-api')

  if (found) return

  await admin.clients.create({
    clientId: 'rnd-api',
    protocol: 'openid-connect',
    surrogateAuthRequired: false,
    clientAuthenticatorType: 'client-secret',
    bearerOnly: true,
    consentRequired: false,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    serviceAccountsEnabled: false,
    publicClient: false,
    fullScopeAllowed: true,
    defaultClientScopes: ['web-origins', 'acr', 'roles', 'profile', 'email'],
    optionalClientScopes: [
      'address',
      'phone',
      'offline_access',
      'microprofile-jwt',
    ],
    attributes: {
      'saml.multivalued.roles': 'false',
      'saml.force.post.binding': 'false',
      'token.endpoint.auth.signing.alg': 'ES256',
      'frontchannel.logout.session.required': 'false',
      'oauth2.device.authorization.grant.enabled': 'false',
      'backchannel.logout.revoke.offline.tokens': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'use.refresh.tokens': 'true',
      'oidc.ciba.grant.enabled': 'false',
      'backchannel.logout.session.required': 'true',
      'client_credentials.use_refresh_token': 'false',
      'saml.client.signature': 'false',
      'require.pushed.authorization.requests': 'false',
      'saml.allow.ecp.flow': 'false',
      'saml.assertion.signature': 'false',
      'id.token.as.detached.signature': 'false',
      'client.secret.creation.time': '1651622315',
      'saml.encrypt': 'false',
      'saml.server.signature': 'false',
      'exclude.session.state.from.auth.response': 'false',
      'saml.artifact.binding': 'false',
      saml_force_name_id_format: 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'acr.loa.map': '{}',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'token.response.type.bearer.lower-case': 'false',
      'saml.onetimeuse.condition': 'false',
    },
  })
}

async function createAppClient(admin: KcAdminClient) {
  const clients = await admin.clients.find()
  const found = clients.find((c) => c.clientId === 'rnd-client')

  if (found) return

  const flows = await admin.authenticationManagement.getFlows()
  const directGrant = flows.find((f) => f.alias === 'direct grant')
  const browserFlow = flows.find((f) => f.alias === 'browser')

  if (!directGrant || !browserFlow) {
    throw new Error('Could not find flows')
  }

  const { appUrl } = config
  const appUrlWithSlash = appUrl + '/'

  await admin.clients.create({
    clientId: 'rnd-client',
    protocol: 'openid-connect',
    rootUrl: appUrlWithSlash,
    adminUrl: appUrlWithSlash,
    baseUrl: '',
    clientAuthenticatorType: 'client-secret',
    redirectUris: [appUrlWithSlash + '*'],
    webOrigins: [appUrl],
    surrogateAuthRequired: false,
    bearerOnly: false,
    consentRequired: false,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    serviceAccountsEnabled: false,
    publicClient: true,
    frontchannelLogout: false,
    fullScopeAllowed: true,
    defaultClientScopes: ['web-origins', 'acr', 'roles', 'profile', 'email'],
    optionalClientScopes: [
      'address',
      'phone',
      'offline_access',
      'microprofile-jwt',
    ],
    attributes: {
      'access.token.lifespan': '60000',
      'saml.multivalued.roles': 'false',
      'saml.force.post.binding': 'false',
      'frontchannel.logout.session.required': 'false',
      'oauth2.device.authorization.grant.enabled': 'false',
      'backchannel.logout.revoke.offline.tokens': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'use.refresh.tokens': 'true',
      'oidc.ciba.grant.enabled': 'false',
      'backchannel.logout.session.required': 'true',
      'client_credentials.use_refresh_token': 'false',
      'saml.client.signature': 'false',
      'require.pushed.authorization.requests': 'false',
      'saml.allow.ecp.flow': 'false',
      'saml.assertion.signature': 'false',
      'id.token.as.detached.signature': 'false',
      'client.secret.creation.time': '1651621904',
      'saml.encrypt': 'false',
      'access.token.signed.response.alg': 'RS256',
      'saml.server.signature': 'false',
      'exclude.session.state.from.auth.response': 'false',
      'saml.artifact.binding': 'false',
      saml_force_name_id_format: 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'acr.loa.map': '{}',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'token.response.type.bearer.lower-case': 'false',
      'saml.onetimeuse.condition': 'false',
    },
    authenticationFlowBindingOverrides: {
      direct_grant: directGrant.id,
      browser: browserFlow.id,
    },
  })
}

async function createUsers(admin: KcAdminClient, add: [string, string][]) {
  const users = await admin.users.find()
  for (const [username, password] of add) {
    const found = users.find((u) => u.username === username)
    if (found) continue

    const user = await admin.users.create({
      username,
      email: `${username}@rnd.lvh.me`,
      emailVerified: true,
      enabled: true,
    })

    await admin.users.resetPassword({
      id: user.id,
      credential: {
        type: 'password',
        value: password,
      },
    })
  }
}

async function main() {
  try {
    const { baseUrl, realmName, options } = config.keycloak

    await waitOn({
      resources: [baseUrl],
      log: true,
      timeout: 60 * 1000,
    })

    const kcAdminClient = new KcAdminClient({
      baseUrl,
    })

    await kcAdminClient.auth(options as any)

    await createRealm(kcAdminClient, realmName)

    kcAdminClient.setConfig({
      realmName,
    })

    await createApiClient(kcAdminClient)
    await createAppClient(kcAdminClient)
    await createUsers(kcAdminClient, [['admin', 'admin']])
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
