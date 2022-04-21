load('ext://uibutton', 'cmd_button', 'bool_input', 'location')
load('ext://current_namespace', 'current_namespace')
load('ext://cert_manager', 'deploy_cert_manager')

namespace = current_namespace()
if not namespace:
  fail("""
    ⚠️ No default namespace found in kubeconfig. Please run
    kubectl config set-context --current --namespace=<name of your stack>
  """)

docker_build('microservice-rnd-cli', 'packages/cli')
docker_build('microservice-rnd-app', 'packages/app')
docker_build('microservice-rnd-api', 'packages/api')
docker_build('microservice-rnd-mailer', 'packages/mailer')
docker_build('microservice-rnd-runner', 'packages/runner')

deploy_cert_manager()

k8s_yaml([
  'deploy/namespace.yaml',

  'deploy/cli-deployment.yaml',
  'deploy/mailer-deployment.yaml',
  'deploy/runner-deployment.yaml',

  'deploy/app-hpa.yaml',
  'deploy/app-deployment.yaml',
  'deploy/app-service.yaml',

  'deploy/api-deployment.yaml',
  'deploy/api-service.yaml',

  'deploy/kowl-deployment.yaml',
  'deploy/kowl-service.yaml',

  'deploy/adminer-deployment.yaml',
  'deploy/adminer-service.yaml',

  'deploy/mailhog-deployment.yaml',
  'deploy/mailhog-service.yaml',

  'deploy/zookeeper-deployment.yaml',
  'deploy/zookeeper-service.yaml',

  'deploy/db-pvc.yaml',
  'deploy/db-deployment.yaml',
  'deploy/db-service.yaml',

  'deploy/kafka-deployment.yaml',
  'deploy/kafka-service.yaml',

  'deploy/cert-selfsigned.yaml',
  'deploy/ingress.yaml',

  'deploy/cleanup-job.yaml',
])

k8s_resource(workload = 'cleanup', labels = 'jobs')
k8s_resource(workload = 'cli', labels = 'workers')
k8s_resource(workload = 'mailer', labels = 'app')
k8s_resource(workload = 'runner', labels = 'app')
k8s_resource(workload = 'app', labels = 'app')
k8s_resource(workload = 'api', labels = 'app')
k8s_resource(workload = 'adminer', labels = 'admin')
k8s_resource(workload = 'mailhog', labels = 'admin')
k8s_resource(workload = 'kowl', labels = 'admin')
k8s_resource(workload = 'db', labels = 'backend')
k8s_resource(workload = 'kafka', labels = 'backend')
k8s_resource(workload = 'zookeeper', labels = 'backend')
k8s_resource(new_name = 'ingress', objects = [
  'ingress-root',
  'ingress-api',
  'ingress-adminer',
  'ingress-mailhog',
  'ingress-kowl'
], labels = 'www')
k8s_resource(new_name = 'cert', objects = [
  'selfsigned-cluster-issuer',
  'selfsigned-ca',
  'selfsigned-issuer',
], labels = 'www')
k8s_resource(new_name = 'pv', objects = [
  'db-data:persistentvolumeclaim',
], labels = 'storage')
k8s_resource(new_name = 'scale', objects = [
  'app:horizontalpodautoscaler',
], labels = 'www')

pod_exec_script = '''
set -eu
POD_NAME="$(tilt get kubernetesdiscovery "cli" -ojsonpath='{.status.pods[0].name}')"
kubectl exec "$POD_NAME" -- npm run migrate
'''
cmd_button('migrate-database',
  argv=['sh', '-c', pod_exec_script],
  location=location.NAV,
  icon_name='build_circle',
  text='Migrate database'
)

pod_exec_script = '''
set -eu
POD_NAME="$(tilt get kubernetesdiscovery "cli" -ojsonpath='{.status.pods[0].name}')"
kubectl exec "$POD_NAME" -- npm run topics
'''
cmd_button('migrate-topics',
  argv=['sh', '-c', pod_exec_script],
  location=location.NAV,
  icon_name='build_circle',
  text='Migrate topics'
)
