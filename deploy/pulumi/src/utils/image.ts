import { Configuration } from '../config'

export const githubImage = (config: Configuration, pkg: string) =>
  `ghcr.io/andersevenrud/microservice-rnd-${pkg}:${config.version}`
