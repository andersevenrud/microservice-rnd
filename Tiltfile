load('ext://cert_manager', 'deploy_cert_manager')

def live_docker_build(name, prod = False):
    if prod:
        docker_build(
          'ghcr.io/andersevenrud/microservice-rnd-%s:latest' % name,
          'packages/%s' % name,
        )
    else:
        docker_build(
          'ghcr.io/andersevenrud/microservice-rnd-%s:latest' % name,
          'packages/%s' % name,
          dockerfile = 'packages/%s/Dockerfile.dev' % name,
          live_update = [
              fall_back_on([
                  'packages/%s/package.json' % name,
                  'packages/%s/package-lock.json' % name
              ]),
              sync(
                  'packages/%s' % name,
                  '/usr/src/%s' % name
              )
          ]
        )

deploy_cert_manager()

live_docker_build('app')
live_docker_build('api')
live_docker_build('mailer')
live_docker_build('runner')
live_docker_build('cli', True)

k8s_yaml(listdir('deploy/dev/1-manifest'))

k8s_resource(workload = 'db-migrations', labels = 'jobs', trigger_mode = TRIGGER_MODE_MANUAL)
k8s_resource(workload = 'topic-migrations', labels = 'jobs', trigger_mode = TRIGGER_MODE_MANUAL)
k8s_resource(workload = 'keycloak-migrations', labels = 'jobs', trigger_mode = TRIGGER_MODE_MANUAL)
k8s_resource(workload = 'cleanup', labels = 'jobs')
k8s_resource(workload = 'mailer', labels = 'app')
k8s_resource(workload = 'runner', labels = 'app')
k8s_resource(workload = 'app', labels = 'app')
k8s_resource(workload = 'api', labels = 'app')
k8s_resource(workload = 'adminer', labels = 'admin')
k8s_resource(workload = 'mailhog', labels = 'admin')
k8s_resource(workload = 'kowl', labels = 'admin')
k8s_resource(workload = 'db', labels = 'backend')
k8s_resource(workload = 'keycloak-db', labels = 'backend')
k8s_resource(workload = 'keycloak', labels = 'backend')
k8s_resource(workload = 'kafka', labels = 'backend')
k8s_resource(workload = 'zookeeper', labels = 'backend')
k8s_resource(new_name = 'ingress', objects = [
  'ingress-root',
  'ingress-api',
  'ingress-adminer',
  'ingress-mailhog',
  'ingress-kowl',
  'ingress-keycloak',
], labels = 'www')
k8s_resource(new_name = 'cert', objects = [
  'selfsigned-cluster-issuer',
  'selfsigned-ca',
  'selfsigned-issuer',
], labels = 'www')
k8s_resource(new_name = 'scale', objects = [
  'app:horizontalpodautoscaler',
], labels = 'www')
