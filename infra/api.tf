resource "aws_apigatewayv2_api" "http" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"

  cors_configuration {
    # Browsers may only call the API from the deployed site and the Vite dev server
    allow_origins = [
      "https://${aws_cloudfront_distribution.site.domain_name}",
      "http://localhost:5173",
    ]
    allow_methods = ["GET"]
  }
}

# Sends requests to the Lambda, with the "v2" event format used in api.ts
resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Catch-all route: every path goes to the Lambda, which does the routing
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

# Published stage, with rate limiting to cap costs in case of abuse
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 10 # requests per second, sustained
    throttling_burst_limit = 20 # short peaks allowed above the rate
  }
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}