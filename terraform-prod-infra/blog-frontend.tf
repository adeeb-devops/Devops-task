# Fetch the latest image tag from AWS Secrets Manager
data "aws_secretsmanager_secret_version" "blog_frontend_image" {
  secret_id = "frontend-image"
}

# Deployment for the blog-frontend
resource "kubernetes_deployment" "blog_frontend" {
  metadata {
    name      = "blog-frontend"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    labels = {
      app = "blog-frontend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "blog-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "blog-frontend"
        }
      }

      spec {
        container {
          name  = "blog-frontend"
          image = "851725644533.dkr.ecr.ap-south-1.amazonaws.com/frontend:${data.aws_secretsmanager_secret_version.blog_frontend_image.secret_string}"

          port {
            name           = "http-port"
            container_port = 80
          }
        }
      }
    }
  }
}

# Service for the blog-frontend
resource "kubernetes_service" "blog_frontend" {
  metadata {
    name      = "blog-frontend"
    namespace = kubernetes_namespace.blog_prod_ns.metadata[0].name
    labels = {
      app = "blog-frontend"
    }
  }

  spec {
    selector = {
      app = "blog-frontend"
    }

    port {
      name        = "http-port"
      protocol    = "TCP"
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}