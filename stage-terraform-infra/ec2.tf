data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-kernel-5.10-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "staging" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3a.medium"
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.staging_sg.id]
  key_name               = "stage-server"

  tags = {
    Name = "staging-server"
  }
}