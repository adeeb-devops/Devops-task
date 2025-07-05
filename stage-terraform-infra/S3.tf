terraform {
  backend "s3" {
    bucket       = "tfstatefile-stage-4533"
    key          = "global/s3/tfstatefile-stage-4533"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = "true"
    depends_on   = [aws_s3_bucket.stage_bucket]

  }
}

resource "aws_s3_bucket" "stage_bucket" {
  bucket = "tfstatefile-stage-4533"
  tags = {
    Name = "tfstatefile-stage-4533"
  }
}