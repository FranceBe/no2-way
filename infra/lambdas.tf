# ---------- Shared settings ----------

locals {
  table_env = { TABLE_NAME = aws_dynamodb_table.readings.name }

  # The TfL key is only added when one is provided
  tfl_env = var.tfl_app_key == "" ? local.table_env : merge(local.table_env, { TFL_APP_KEY = var.tfl_app_key })
}

# ---------- Packages ----------

data "archive_file" "ingest" {
  type        = "zip"
  source_file = "${path.module}/../backend/dist/ingest.mjs"
  output_path = "${path.module}/build/ingest.zip"
}

data "archive_file" "ingest_tfl" {
  type        = "zip"
  source_file = "${path.module}/../backend/dist/ingest-tfl.mjs"
  output_path = "${path.module}/build/ingest-tfl.zip"
}

data "archive_file" "api" {
  type        = "zip"
  source_file = "${path.module}/../backend/dist/api.mjs"
  output_path = "${path.module}/build/api.zip"
}

# ---------- Functions ----------

resource "aws_lambda_function" "ingest" {
  function_name    = "${var.project}-ingest"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  handler          = "ingest.handler"
  filename         = data.archive_file.ingest.output_path
  source_code_hash = data.archive_file.ingest.output_base64sha256
  timeout          = 30

  environment {
    variables = local.table_env
  }
}

resource "aws_lambda_function" "ingest_tfl" {
  function_name    = "${var.project}-ingest-tfl"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  handler          = "ingest-tfl.handler"
  filename         = data.archive_file.ingest_tfl.output_path
  source_code_hash = data.archive_file.ingest_tfl.output_base64sha256
  timeout          = 30

  environment {
    variables = local.tfl_env
  }
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project}-api"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  handler          = "api.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  memory_size      = 256 # the full BikePoint list is large
  timeout          = 15  # live calls to TfL can be slow

  environment {
    variables = local.tfl_env
  }
}

# ---------- Logs: 7-day retention ----------

resource "aws_cloudwatch_log_group" "ingest" {
  name              = "/aws/lambda/${aws_lambda_function.ingest.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ingest_tfl" {
  name              = "/aws/lambda/${aws_lambda_function.ingest_tfl.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 7
}

# ---------- Schedule: air quality every hour ----------

resource "aws_cloudwatch_event_rule" "hourly" {
  name                = "${var.project}-hourly"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "ingest" {
  rule = aws_cloudwatch_event_rule.hourly.name
  arn  = aws_lambda_function.ingest.arn
}

resource "aws_lambda_permission" "events" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.hourly.arn
}

# ---------- Schedule: TfL every 15 minutes ----------

resource "aws_cloudwatch_event_rule" "every_15_min" {
  name                = "${var.project}-every-15-min"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "ingest_tfl" {
  rule = aws_cloudwatch_event_rule.every_15_min.name
  arn  = aws_lambda_function.ingest_tfl.arn
}

resource "aws_lambda_permission" "events_tfl" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest_tfl.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_15_min.arn
}