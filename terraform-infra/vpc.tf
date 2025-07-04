module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.17.0"

  name                       = "vpc-prod"
  cidr                       = "10.1.0.0/16"
  azs                        = ["ap-south-1a", "ap-south-1b"]
  private_subnets            = ["10.1.0.0/20", "10.1.16.0/20"]
  public_subnets             = ["10.1.33.0/24", "10.1.34.0/24"]
  enable_dns_support         = true
  enable_dns_hostnames       = true
  manage_default_network_acl = false

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/eks-prod"  = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/role/elb"         = "1"
    "kubernetes.io/cluster/eks-prod" = "shared"
  }

  tags = {
    Name = "vpc-prod"
  }
}

# Elastic IP for Public Subnet
resource "aws_eip" "nat" {
  domain = "vpc" # Specify the domain for VPC
  tags = {
    Name = "nat-eip"
  }
}

# Create NAT Gateway in a Public Subnet
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = module.vpc.public_subnets[0] # Use the first public subnet
  tags = {
    Name = "nat-gateway"
  }
}

# Update private route tables to use NAT Gateway
resource "aws_route" "private_to_nat" {
  count                  = length(module.vpc.private_route_table_ids)
  route_table_id         = module.vpc.private_route_table_ids[count.index]
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}
