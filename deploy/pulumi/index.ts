import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import createDefaults from './src/kubernetes'

const config = new pulumi.Config()

const provider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: '../dev',
})

createDefaults(config, provider)
