import { parse } from 'yaml'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import createConfiguration from './src/kubernetes'

const config = new pulumi.Config()
const mode = config.get('mode') || 'dev'

const kubeConfigRaw = config.get('kubeconfig')
const kubeConfig = kubeConfigRaw ? parse(kubeConfigRaw) : undefined

let provider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: `../${mode}`,
})

if (kubeConfig && !process.env.GENERATE_YAML) {
  provider = new k8s.Provider('k8s', {
    kubeconfig: kubeConfig,
  })
}

createConfiguration(config, provider)
