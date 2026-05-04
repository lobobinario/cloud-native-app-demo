"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkPizzeriaEsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_lambda_2 = require("aws-cdk-lib/aws-lambda");
const aws_sqs_1 = require("aws-cdk-lib/aws-sqs");
const aws_lambda_event_sources_1 = require("aws-cdk-lib/aws-lambda-event-sources");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
class CdkPizzeriaEsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // The code that defines your stack goes here
        // SQS queue
        const pendingOrdersQueue = new aws_sqs_1.Queue(this, 'PendingOrdersQueue', {});
        const ordersToSendQueue = new aws_sqs_1.Queue(this, 'OrdersToSendQueue', {});
        // DynamoDB table
        const ordersTable = new aws_dynamodb_1.Table(this, 'OrdersTable', {
            partitionKey: {
                name: 'orderId',
                type: aws_dynamodb_1.AttributeType.STRING
            },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST
        });
        // new lambda function
        const newOrderFunction = new aws_lambda_2.Function(this, 'NewOrderFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.newOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                PENDING_ORDERS_QUEUE_URL: pendingOrdersQueue.queueUrl,
                ORDERS_TABLE_NAME: ordersTable.tableName
            }
        });
        // adding iam permissions to lambda to send messages to sqs
        pendingOrdersQueue.grantSendMessages(newOrderFunction);
        ordersTable.grantWriteData(newOrderFunction);
        const getOrderFunction = new aws_lambda_2.Function(this, 'GetOrderFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.getOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
        });
        const prepOrderFunction = new aws_lambda_2.Function(this, 'PrepOrderFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.prepOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
        });
        // add sqs event source to lambda
        prepOrderFunction.addEventSource(new aws_lambda_event_sources_1.SqsEventSource(pendingOrdersQueue, {
            batchSize: 1
        }));
        const sendOrderFunction = new aws_lambda_2.Function(this, 'SendOrderFunction', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
            handler: 'handler.sendOrder',
            code: aws_lambda_1.Code.fromAsset('lib/functions'),
            environment: {
                ORDERS_TO_SEND_QUEUE_URL: ordersToSendQueue.queueUrl,
            }
        });
        ordersToSendQueue.grantSendMessages(sendOrderFunction);
        // new api gateway
        const api = new apigateway.RestApi(this, 'PizzeriaApi', {
            restApiName: 'Pizzeria CDK Service',
        });
        const orderResource = api.root.addResource('order');
        orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));
        orderResource.addResource('{orderId}').addMethod('GET', new apigateway.LambdaIntegration(getOrderFunction));
    }
}
exports.CdkPizzeriaEsStack = CdkPizzeriaEsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXBpenplcmlhLWVzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXBpenplcmlhLWVzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBRW5DLHVEQUF1RDtBQUN2RCx1REFBa0Q7QUFDbEQsaURBQTRDO0FBQzVDLG1GQUFzRTtBQUN0RSwyREFBNkU7QUFDN0UsdUVBQXlEO0FBRXpELE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw2Q0FBNkM7UUFDN0MsWUFBWTtRQUNaLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLGlCQUFpQjtRQUNqQixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqRCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTTthQUMzQjtZQUNELFdBQVcsRUFBRSwwQkFBVyxDQUFDLGVBQWU7U0FDekMsQ0FBQyxDQUFDO1FBQ0gsc0JBQXNCO1FBQ3RCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM5RCxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsSUFBSSxFQUFFLGlCQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gsd0JBQXdCLEVBQUUsa0JBQWtCLENBQUMsUUFBUTtnQkFDckQsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLFNBQVM7YUFDekM7U0FDRixDQUFDLENBQUM7UUFDSCwyREFBMkQ7UUFDM0Qsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RCxXQUFXLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFN0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzlELE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLGtCQUFrQjtZQUMzQixJQUFJLEVBQUUsaUJBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1NBRXRDLENBQUMsQ0FBQztRQUdILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNoRSxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsSUFBSSxFQUFFLGlCQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztTQUN0QyxDQUFDLENBQUM7UUFFSCxpQ0FBaUM7UUFDakMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUkseUNBQWMsQ0FBQyxrQkFBa0IsRUFBRTtZQUN0RSxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ2hFLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixJQUFJLEVBQUUsaUJBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCx3QkFBd0IsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRO2FBQ3JEO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUV2RCxrQkFBa0I7UUFDbEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDdEQsV0FBVyxFQUFFLHNCQUFzQjtTQUNwQyxDQUFDLENBQUM7UUFFUCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDcEYsYUFBYSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUN4RyxDQUFDO0NBQ0o7QUFyRUQsZ0RBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29kZSwgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgeyBTcXNFdmVudFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcyc7XG5pbXBvcnQgeyBUYWJsZSwgQXR0cmlidXRlVHlwZSwgQmlsbGluZ01vZGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5cbmV4cG9ydCBjbGFzcyBDZGtQaXp6ZXJpYUVzU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBUaGUgY29kZSB0aGF0IGRlZmluZXMgeW91ciBzdGFjayBnb2VzIGhlcmVcbiAgICAvLyBTUVMgcXVldWVcbiAgICBjb25zdCBwZW5kaW5nT3JkZXJzUXVldWUgPSBuZXcgUXVldWUodGhpcywgJ1BlbmRpbmdPcmRlcnNRdWV1ZScsIHt9KTtcbiAgICBjb25zdCBvcmRlcnNUb1NlbmRRdWV1ZSA9IG5ldyBRdWV1ZSh0aGlzLCAnT3JkZXJzVG9TZW5kUXVldWUnLCB7fSk7XG4gICAgLy8gRHluYW1vREIgdGFibGVcbiAgICBjb25zdCBvcmRlcnNUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCAnT3JkZXJzVGFibGUnLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogJ29yZGVySWQnLFxuICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklOR1xuICAgICAgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBCaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1RcbiAgICB9KTtcbiAgICAvLyBuZXcgbGFtYmRhIGZ1bmN0aW9uXG4gICAgY29uc3QgbmV3T3JkZXJGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCAnTmV3T3JkZXJGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIyX1gsXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlci5uZXdPcmRlcicsXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldCgnbGliL2Z1bmN0aW9ucycpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUEVORElOR19PUkRFUlNfUVVFVUVfVVJMOiBwZW5kaW5nT3JkZXJzUXVldWUucXVldWVVcmwsXG4gICAgICAgIE9SREVSU19UQUJMRV9OQU1FOiBvcmRlcnNUYWJsZS50YWJsZU5hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBhZGRpbmcgaWFtIHBlcm1pc3Npb25zIHRvIGxhbWJkYSB0byBzZW5kIG1lc3NhZ2VzIHRvIHNxc1xuICAgIHBlbmRpbmdPcmRlcnNRdWV1ZS5ncmFudFNlbmRNZXNzYWdlcyhuZXdPcmRlckZ1bmN0aW9uKTtcbiAgICBvcmRlcnNUYWJsZS5ncmFudFdyaXRlRGF0YShuZXdPcmRlckZ1bmN0aW9uKTtcblxuICAgIGNvbnN0IGdldE9yZGVyRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgJ0dldE9yZGVyRnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXIuZ2V0T3JkZXInLFxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQoJ2xpYi9mdW5jdGlvbnMnKSxcbiAgICAgIFxuICAgIH0pO1xuICAgIFxuXG4gICAgY29uc3QgcHJlcE9yZGVyRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgJ1ByZXBPcmRlckZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjJfWCxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyLnByZXBPcmRlcicsXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldCgnbGliL2Z1bmN0aW9ucycpLFxuICAgIH0pO1xuXG4gICAgLy8gYWRkIHNxcyBldmVudCBzb3VyY2UgdG8gbGFtYmRhXG4gICAgcHJlcE9yZGVyRnVuY3Rpb24uYWRkRXZlbnRTb3VyY2UobmV3IFNxc0V2ZW50U291cmNlKHBlbmRpbmdPcmRlcnNRdWV1ZSwge1xuICAgICAgYmF0Y2hTaXplOiAxXG4gICAgfSkpO1xuICAgIFxuICAgIGNvbnN0IHNlbmRPcmRlckZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsICdTZW5kT3JkZXJGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIyX1gsXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlci5zZW5kT3JkZXInLFxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQoJ2xpYi9mdW5jdGlvbnMnKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE9SREVSU19UT19TRU5EX1FVRVVFX1VSTDogb3JkZXJzVG9TZW5kUXVldWUucXVldWVVcmwsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBvcmRlcnNUb1NlbmRRdWV1ZS5ncmFudFNlbmRNZXNzYWdlcyhzZW5kT3JkZXJGdW5jdGlvbik7XG5cbiAgICAvLyBuZXcgYXBpIGdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdQaXp6ZXJpYUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnUGl6emVyaWEgQ0RLIFNlcnZpY2UnLFxuICAgIH0pO1xuXG5jb25zdCBvcmRlclJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ29yZGVyJyk7XG5vcmRlclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKG5ld09yZGVyRnVuY3Rpb24pKTtcbm9yZGVyUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3tvcmRlcklkfScpLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0T3JkZXJGdW5jdGlvbikpO1xuICAgIH1cbn1cbiJdfQ==