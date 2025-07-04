# First Ingress Controller (for backend)
resource "helm_release" "nginx_ingress_backend" {
  name             = "nginx-backend"
  chart            = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  version          = "4.12.0"
  namespace        = "nginx-backend"
  create_namespace = true

  set = [
    { name = "controller.ingressClassResource.name", value = "nginx-backend" },
    { name = "controller.ingressClass", value = "nginx-backend" },
    { name = "controller.service.type", value = "LoadBalancer" },
  ]
}

# Second Ingress Controller (for frontend)
resource "helm_release" "nginx_ingress_frontend" {
  name             = "nginx-frontend"
  chart            = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  version          = "4.12.0"
  namespace        = "nginx-frontend"
  create_namespace = true

  set = [
    { name = "controller.ingressClassResource.name", value = "nginx-frontend" },
    { name = "controller.ingressClass", value = "nginx-frontend" },
    { name = "controller.service.type", value = "LoadBalancer" },
  ]
}

# Third Ingress Controller (for monitoring)
resource "helm_release" "nginx_ingress_monitoring" {
  name             = "nginx-monitoring"
  chart            = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  version          = "4.12.0"
  namespace        = "monitoring"
  create_namespace = true

  set = [
    { name = "controller.ingressClassResource.name", value = "nginx-monitoring" },
    { name = "controller.ingressClass", value = "nginx-monitoring" },
    { name = "controller.service.type", value = "LoadBalancer" },
  ]
}
