resource "aws_dynamodb_table" "readings" {
  name           = "${var.project}-readings"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "location"
  range_key      = "ts"

  attribute {
    name = "location"
    type = "S"
  }

  attribute {
    name = "ts"
    type = "S"
  }
}