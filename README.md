#  Course application for the course "Serverless en Español con AWS y AWS CDK"

Infrastructure as code framework used: Serverless Framework AWS Services used: AWS Lambda, API Gateway, SQS, DynamoDB

## Summary of the demo

In this demo you will see:

- How to build a simple serverless application with AWS components and AWS CDK

This demo is part of a course published by Marcia Villalba.
If you want to find the whole course you can ask her about the different places where the couse is available.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the AWS Pricing page for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements
- AWS CDK
- NodeJS 22.x installed


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
* `cdk destroy`     remove all the deployed resources from your AWS account
