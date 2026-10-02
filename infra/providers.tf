terraform {
  required_version = ">= 1.6"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }
}

variable "region" { default = "eu-west-2" }
variable "project" { default = "no2-way" }

variable "tfl_app_key" {
  description = "TfL Unified API key (optional, raises the rate limit)"
  type        = string
  default     = ""
  sensitive   = true
}

provider "aws" {
  region = var.region
  default_tags { tags = { Project = var.project } }
}