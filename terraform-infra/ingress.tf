resource "kubernetes_ingress_v1" "blog_backend" {
  metadata {
    name      = "blog-backend-ingress"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx-backend"
    }
  }

  spec {
    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.blog_backend.metadata[0].name
              port {
                number = 5000
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_ingress_v1" "blog_frontend" {
  metadata {
    name      = "blog-frontend-ingress"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx-frontend"
    }
  }

  spec {
    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.blog_frontend.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}

