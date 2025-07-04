resource "kubernetes_namespace" "blog_prod_ns" {
  metadata {
    name = "blog-prod"
  }
}

# Fetch the latest image tag from AWS Secrets Manager
data "aws_secretsmanager_secret_version" "blog_backend_image" {
  secret_id = "backend-image"
}

# ConfigMap for environment variables
resource "kubernetes_config_map" "blog_backend_env" {
  metadata {
    name      = "blog-backend-configmap"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
  }

  data = {
    DATABASE_URL = "postgres://postgres:qgAdminProd1234@db.cjc04cu0y569.ap-south-1.rds.amazonaws.com:5432/db"
    PORT         = "5000"
    JWT_SECRET   = "secret_key"
  }
}

# Deployment for the blog-backend
resource "kubernetes_deployment" "blog_backend" {
  metadata {
    name      = "blog-backend"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    labels = {
      app = "blog-backend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "blog-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "blog-backend"
        }
      }

      spec {
        container {
          name  = "blog-backend"
          image = "851725644533.dkr.ecr.ap-south-1.amazonaws.com/backend:${data.aws_secretsmanager_secret_version.blog_backend_image.secret_string}"

          port {
            name           = "http-port"
            container_port = 5000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.blog_backend_env.metadata[0].name
            }
          }
        }
      }
    }
  }
}

# Service for the blog-backend
resource "kubernetes_service" "blog_backend" {
  metadata {
    name      = "blog-backend"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    labels = {
      app = "blog-backend"
    }
  }

  spec {
    selector = {
      app = "blog-backend"
    }

    port {
      name        = "http-port"
      protocol    = "TCP"
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}