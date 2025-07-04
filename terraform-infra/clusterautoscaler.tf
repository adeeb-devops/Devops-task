resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  namespace  = "kube-system"
  chart      = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  version    = "9.44.0"

  set = [
    { name = "autoDiscovery.clusterName", value = module.eks.cluster_name },
    { name = "awsRegion", value = "ap-south-1" },
    { name = "rbac.serviceAccount.create", value = "true" },
    { name = "extraArgs.balance-similar-node-groups", value = "true" },
    { name = "extraArgs.skip-nodes-with-local-storage", value = "false" },
    { name = "extraArgs.expander", value = "least-waste" },
    { name = "resources.requests.cpu", value = "500m" },
    { name = "resources.requests.memory", value = "512Mi" },
    { name = "resources.limits.cpu", value = "1000m" },
    { name = "resources.limits.memory", value = "1024Mi" },
  ]

  depends_on = [module.eks]
}
