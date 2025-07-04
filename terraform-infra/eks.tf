module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "20.37.1"
  cluster_name    = "eks-prod"
  cluster_version = "1.32"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = concat(module.vpc.private_subnets, module.vpc.public_subnets)

  enable_cluster_creator_admin_permissions = true
  cluster_endpoint_private_access          = true
  cluster_endpoint_public_access           = true
  enable_irsa                              = true
  create_iam_role                          = true
  create_node_iam_role                     = true
  create_node_security_group               = true
  enable_security_groups_for_pods          = true
  create_kms_key                           = true
  cluster_addons = {
    coredns                = {}
    eks-pod-identity-agent = {}
    kube-proxy             = {}
    aws-ebs-csi-driver     = {}
  }

  eks_managed_node_groups = {
    eks_node_group = {
      name           = "eks_node_group"
      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      subnet_ids     = module.vpc.private_subnets
      disk_size      = 20

      tags = {
        Environment                                            = "prod"
        Terraform                                              = "true"
        "k8s.io/cluster-autoscaler/enabled"                    = "true"
        "k8s.io/cluster-autoscaler/${module.eks.cluster_name}" = "true"
      }

      iam_role_additional_policies = {
        AmazonEKSWorkerNodePolicy            = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        AmazonEC2ContainerRegistryReadOnly   = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
        AmazonEKS_CNI_Policy                 = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        AmazonEBSCSIDriverPolicy             = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy",
        AmazonEKSClusterAutoscalerPolicyProd = aws_iam_policy.cluster_autoscaler_policy.arn
      }
    }
  }

  tags = {
    Environment = "prod"
  }

  depends_on = [module.vpc]
}