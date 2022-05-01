import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import createConfiguration from './src/kubernetes'

const config = new pulumi.Config()
const mode = config.get('mode') || 'dev'

const provider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: `../${mode}`,
})

createConfiguration(config, provider)
