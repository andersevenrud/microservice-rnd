# Kubernetes

General information about using Kubernetes on local and remote clusters.

## Local Cluster Setup

Running a local cluster with minikube is done in a few simple steps.

### Set up minikube

```bash
minikube start
minikube addons enable ingress
minikube addons enable ingress-dns
```

Now get the IP of your cluster:

```bash
minikube ip
```

### Set up DNS

These steps were made using Arch Linux using NetworkManager and dnsmasq, which might not apply to your setup.

> See [minikube documentation](https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/) for more information.

```bash
sudo mkdir -p /etc/NetworkManager/dnsmasq.d
echo "server=/rnd.lvh.me/192.168.49.2" | sudo tee -a /etc/NetworkManager/dnsmasq.d/minikube.conf
sudo nmcli general reload
```

### Local deployment

Simply run `tilt up`.
