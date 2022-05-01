import { Config } from '@pulumi/pulumi'

export const githubImage = (config: Config, pkg: string) =>
  `ghcr.io/andersevenrud/microservice-rnd-${pkg}:${
    config.get('version') || 'latest'
  }`
