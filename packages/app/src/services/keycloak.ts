import Keycloak from 'keycloak-js'
import config from '../config'

const keycloak = new Keycloak(config.keycloak)

export default keycloak
