import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import createKubernetes from './src/kubernetes'
import createConfig from './src/config'

const cfg = new pulumi.Config()
const config = createConfig(cfg)

let provider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: `../${config.name}`,
})

if (config.kubeConfig && !process.env.GENERATE_YAML) {
  provider = new k8s.Provider('k8s', {
    kubeconfig: config.kubeConfig,
  })
}

createKubernetes(config, provider)
