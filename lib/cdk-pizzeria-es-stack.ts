import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, FilterCriteria, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { DynamoEventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class CdkPizzeriaEsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // SQS queues
    const pendingOrdersQueue = new Queue(this, 'PendingOrdersQueue', {});
    const ordersToSendQueue = new Queue(this, 'OrdersToSendQueue', {});

    // DynamoDB tables
    const ordersTable = new Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Functions
    const newOrderFunction = new Function(this, 'NewOrderFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.newOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        PENDING_ORDERS_QUEUE_URL: pendingOrdersQueue.queueUrl,
        ORDER_TABLE_NAME: ordersTable.tableName,
      }
    });

    pendingOrdersQueue.grantSendMessages(newOrderFunction);
    ordersTable.grantWriteData(newOrderFunction);

    const getOrderFunction = new Function(this, 'GetOrderFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.getOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        ORDER_TABLE_NAME: ordersTable.tableName,
      }
    });

    ordersTable.grantReadData(getOrderFunction);

    const prepOrderFunction = new Function(this, 'PrepOrderFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.prepOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        ORDER_TABLE_NAME: ordersTable.tableName
      }
    });

    prepOrderFunction.addEventSource(new SqsEventSource(pendingOrdersQueue, {
      batchSize: 1
    }));

    ordersTable.grantWriteData(prepOrderFunction);

    const sendOrderFunction = new Function(this, 'SendOrderFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler.sendOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        ORDERS_TO_SEND_QUEUE_URL: ordersToSendQueue.queueUrl,
      }
    });

    sendOrderFunction.addEventSource(new DynamoEventSource(ordersTable, {
      startingPosition: StartingPosition.LATEST,
      batchSize: 1,
      filters: [
        FilterCriteria.filter({
          eventName: ['MODIFY']
        })
      ]
    }));

    ordersToSendQueue.grantSendMessages(sendOrderFunction);
    ordersTable.grantStreamRead(sendOrderFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'PizzeriaApi', {
      restApiName: 'Pizzeria CDK Service'
    });

    const orderResource = api.root.addResource('order');
    orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));
    orderResource.addResource('{orderId}').addMethod('GET', new apigateway.LambdaIntegration(getOrderFunction));

  }
}