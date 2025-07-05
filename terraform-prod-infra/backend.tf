terraform {
  backend "s3" {
    bucket       = "tfstatefile-4533"
    key          = "global/s3/tfstatefile-4533"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = "true"
  }
}