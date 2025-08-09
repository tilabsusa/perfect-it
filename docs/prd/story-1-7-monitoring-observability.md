# Story 1.7: Monitoring and Observability Setup

## Story Statement

As a platform operator,  
I want comprehensive monitoring and observability across all services,  
so that we can proactively identify issues, optimize performance, and ensure high availability for our users.

## Priority: HIGH

This story should be completed as part of Epic 1 to ensure monitoring is in place from the start.

## Monitoring Architecture

```
Application Metrics → CloudWatch → Dashboards → Alarms → SNS → PagerDuty/Slack
        ↓                 ↓           ↓
    X-Ray Traces    Logs Insights   Cost Explorer
        ↓                 ↓           ↓
    Performance      Error Analysis  Budget Alerts
```

## Implementation Plan

### Part A: CloudWatch Metrics and Dashboards

#### Step 1: Define Custom Metrics

**File:** `src/lib/monitoring/metrics.ts`

```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION });

export enum MetricNames {
  // User metrics
  USER_SIGNUP = 'UserSignup',
  USER_LOGIN = 'UserLogin',
  USER_LOGIN_FAILED = 'UserLoginFailed',

  // Card metrics
  CARD_CREATED = 'CardCreated',
  CARD_VIEWED = 'CardViewed',
  CARD_VOTED = 'CardVoted',
  CARD_SAVED = 'CardSaved',

  // Image metrics
  IMAGE_UPLOADED = 'ImageUploaded',
  IMAGE_PROCESSED = 'ImageProcessed',
  IMAGE_PROCESSING_FAILED = 'ImageProcessingFailed',
  IMAGE_PROCESSING_DURATION = 'ImageProcessingDuration',

  // API metrics
  API_REQUEST = 'APIRequest',
  API_ERROR = 'APIError',
  API_LATENCY = 'APILatency',

  // Search metrics
  SEARCH_PERFORMED = 'SearchPerformed',
  SEARCH_RESULTS_EMPTY = 'SearchResultsEmpty',
  SEARCH_LATENCY = 'SearchLatency',
}

class MetricsClient {
  private namespace = 'PerfectIt';
  private environment: string;
  private batchedMetrics: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'dev';
  }

  async putMetric(
    metricName: MetricNames,
    value: number,
    unit: 'Count' | 'Milliseconds' | 'Bytes' | 'Percent' = 'Count',
    dimensions?: Record<string, string>
  ) {
    const metric = {
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
      Dimensions: [
        { Name: 'Environment', Value: this.environment },
        ...(dimensions
          ? Object.entries(dimensions).map(([name, value]) => ({ Name: name, Value: value }))
          : []),
      ],
    };

    // Batch metrics for efficiency
    this.batchedMetrics.push(metric);

    if (this.batchedMetrics.length >= 20) {
      await this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), 5000);
    }
  }

  async flush() {
    if (this.batchedMetrics.length === 0) return;

    const metrics = [...this.batchedMetrics];
    this.batchedMetrics = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await cloudwatch.send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: metrics,
        })
      );
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  // Helper methods for common metrics
  async trackUserAction(action: 'signup' | 'login' | 'logout', success: boolean = true) {
    const metricMap = {
      signup: MetricNames.USER_SIGNUP,
      login: success ? MetricNames.USER_LOGIN : MetricNames.USER_LOGIN_FAILED,
      logout: MetricNames.USER_LOGIN, // Track as negative value
    };

    await this.putMetric(metricMap[action], action === 'logout' ? -1 : 1, 'Count');
  }

  async trackAPICall(endpoint: string, method: string, statusCode: number, duration: number) {
    // Track request count
    await this.putMetric(MetricNames.API_REQUEST, 1, 'Count', {
      Endpoint: endpoint,
      Method: method,
      StatusCode: statusCode.toString(),
    });

    // Track errors
    if (statusCode >= 400) {
      await this.putMetric(MetricNames.API_ERROR, 1, 'Count', {
        Endpoint: endpoint,
        Method: method,
        StatusCode: statusCode.toString(),
      });
    }

    // Track latency
    await this.putMetric(MetricNames.API_LATENCY, duration, 'Milliseconds', {
      Endpoint: endpoint,
      Method: method,
    });
  }

  async trackCardAction(
    action: 'create' | 'view' | 'vote' | 'save',
    cardId: string,
    category?: string
  ) {
    const metricMap = {
      create: MetricNames.CARD_CREATED,
      view: MetricNames.CARD_VIEWED,
      vote: MetricNames.CARD_VOTED,
      save: MetricNames.CARD_SAVED,
    };

    await this.putMetric(
      metricMap[action],
      1,
      'Count',
      category ? { Category: category } : undefined
    );
  }
}

export const metrics = new MetricsClient();
```

#### Step 2: Create CloudWatch Dashboard

**File:** `amplify/backend/monitoring/dashboard.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class MonitoringDashboard extends Construct {
  constructor(scope: Construct, id: string, props: { environment: string }) {
    super(scope, id);

    const dashboard = new cloudwatch.Dashboard(this, 'PerfectItDashboard', {
      dashboardName: `PerfectIt-${props.environment}`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // User Activity Widget
    const userActivityWidget = new cloudwatch.GraphWidget({
      title: 'User Activity',
      left: [
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'UserSignup',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
          label: 'Signups',
        }),
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'UserLogin',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
          label: 'Logins',
        }),
      ],
      right: [
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'UserLoginFailed',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
          label: 'Failed Logins',
          color: cloudwatch.Color.RED,
        }),
      ],
      width: 12,
      height: 6,
    });

    // API Performance Widget
    const apiPerformanceWidget = new cloudwatch.GraphWidget({
      title: 'API Performance',
      left: [
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'APIRequest',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
          label: 'Total Requests',
        }),
      ],
      right: [
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'APILatency',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Average',
          label: 'Avg Latency (ms)',
          color: cloudwatch.Color.ORANGE,
        }),
      ],
      width: 12,
      height: 6,
    });

    // Error Rate Widget
    const errorRateWidget = new cloudwatch.MathExpression({
      expression: 'errors / requests * 100',
      usingMetrics: {
        errors: new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'APIError',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
        requests: new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'APIRequest',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
      },
      label: 'Error Rate %',
      color: cloudwatch.Color.RED,
    });

    // Card Activity Widget
    const cardActivityWidget = new cloudwatch.GraphWidget({
      title: 'Card Activity',
      left: [
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'CardCreated',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'CardViewed',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'CardVoted',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
        new cloudwatch.Metric({
          namespace: 'PerfectIt',
          metricName: 'CardSaved',
          dimensionsMap: { Environment: props.environment },
          statistic: 'Sum',
        }),
      ],
      width: 24,
      height: 6,
    });

    // Add widgets to dashboard
    dashboard.addWidgets(userActivityWidget, apiPerformanceWidget);
    dashboard.addWidgets(cardActivityWidget);
  }
}
```

### Part B: Application Logging

#### Step 3: Structured Logging Setup

**File:** `src/lib/logging/logger.ts`

```typescript
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'dev';
const isProduction = environment === 'prod';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  levels,
  format: jsonFormat,
  defaultMeta: {
    service: 'perfectit-frontend',
    environment,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isProduction ? jsonFormat : consoleFormat,
    }),
  ],
});

// Add CloudWatch transport in production
if (isProduction && process.env.AWS_REGION) {
  logger.add(
    new WinstonCloudWatch({
      logGroupName: `/aws/amplify/perfectit/${environment}`,
      logStreamName: `frontend-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION,
      messageFormatter: (item) => {
        return JSON.stringify({
          timestamp: item.timestamp,
          level: item.level,
          message: item.message,
          ...item.meta,
        });
      },
    })
  );
}

// Create specialized loggers
export const apiLogger = logger.child({ component: 'api' });
export const authLogger = logger.child({ component: 'auth' });
export const dbLogger = logger.child({ component: 'database' });

// Log uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default logger;
```

#### Step 4: API Middleware Logging

**File:** `src/middleware/logging.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from '@/lib/logging/logger';
import { metrics } from '@/lib/monitoring/metrics';
import { v4 as uuidv4 } from 'uuid';

export async function loggingMiddleware(request: NextRequest) {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Add request ID to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  // Log request
  apiLogger.info('API Request', {
    requestId,
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    ip: request.ip || request.headers.get('x-forwarded-for'),
  });

  try {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Log response
    const duration = Date.now() - startTime;
    const statusCode = response.status;

    apiLogger.info('API Response', {
      requestId,
      statusCode,
      duration,
    });

    // Send metrics
    await metrics.trackAPICall(new URL(request.url).pathname, request.method, statusCode, duration);

    // Add custom headers
    response.headers.set('x-request-id', requestId);
    response.headers.set('x-response-time', `${duration}ms`);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.error('API Error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    });

    // Send error metrics
    await metrics.trackAPICall(new URL(request.url).pathname, request.method, 500, duration);

    return NextResponse.json({ error: 'Internal Server Error', requestId }, { status: 500 });
  }
}
```

### Part C: AWS X-Ray Tracing

#### Step 5: Configure X-Ray Tracing

**File:** `src/lib/tracing/xray.ts`

```typescript
import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// Only enable X-Ray in production
const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod';

if (isProduction) {
  AWSXRay.config([AWSXRay.plugins.ECSPlugin, AWSXRay.plugins.ElasticBeanstalkPlugin]);

  // Set sampling rules
  AWSXRay.middleware.setSamplingRules({
    version: 2,
    rules: [
      {
        description: 'Basic sampling',
        service_name: 'perfectit',
        http_method: '*',
        url_path: '*',
        fixed_target: 1,
        rate: 0.1, // Sample 10% of requests
      },
    ],
    default: {
      fixed_target: 1,
      rate: 0.05, // Sample 5% by default
    },
  });
}

// Wrap AWS SDK clients
export const tracedDynamoDB = isProduction
  ? AWSXRay.captureAWSClient(new DynamoDBClient({}))
  : new DynamoDBClient({});

export const tracedS3 = isProduction
  ? AWSXRay.captureAWSClient(new S3Client({}))
  : new S3Client({});

// Helper to create subsegments
export function traceAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (!isProduction) {
    return fn();
  }

  return new Promise((resolve, reject) => {
    AWSXRay.captureAsyncFunc(name, (subsegment) => {
      fn()
        .then((result) => {
          subsegment?.close();
          resolve(result);
        })
        .catch((error) => {
          subsegment?.addError(error);
          subsegment?.close();
          reject(error);
        });
    });
  });
}

// Trace custom operations
export function addTraceMetadata(key: string, value: any) {
  if (isProduction) {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addMetadata(key, value);
    }
  }
}

export function addTraceAnnotation(key: string, value: string | number | boolean) {
  if (isProduction) {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addAnnotation(key, value);
    }
  }
}
```

### Part D: CloudWatch Alarms

#### Step 6: Define Critical Alarms

**File:** `amplify/backend/monitoring/alarms.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export class MonitoringAlarms extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      environment: string;
      alarmEmail: string;
      slackWebhookUrl?: string;
    }
  ) {
    super(scope, id);

    // Create SNS topic for alarms
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `PerfectIt-Alarms-${props.environment}`,
      displayName: 'PerfectIt Critical Alarms',
    });

    // Add email subscription
    alarmTopic.addSubscription(new snsSubscriptions.EmailSubscription(props.alarmEmail));

    // Add Slack webhook if provided
    if (props.slackWebhookUrl) {
      // This would require a Lambda function to forward to Slack
      // Simplified for brevity
    }

    // High Error Rate Alarm
    const errorRateAlarm = new cloudwatch.Alarm(this, 'HighErrorRate', {
      alarmName: `PerfectIt-${props.environment}-HighErrorRate`,
      alarmDescription: 'API error rate exceeds 5%',
      metric: new cloudwatch.MathExpression({
        expression: '(errors / requests) * 100',
        usingMetrics: {
          errors: new cloudwatch.Metric({
            namespace: 'PerfectIt',
            metricName: 'APIError',
            dimensionsMap: { Environment: props.environment },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
          }),
          requests: new cloudwatch.Metric({
            namespace: 'PerfectIt',
            metricName: 'APIRequest',
            dimensionsMap: { Environment: props.environment },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
          }),
        },
      }),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    errorRateAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // High API Latency Alarm
    const latencyAlarm = new cloudwatch.Alarm(this, 'HighAPILatency', {
      alarmName: `PerfectIt-${props.environment}-HighLatency`,
      alarmDescription: 'API latency exceeds 3 seconds',
      metric: new cloudwatch.Metric({
        namespace: 'PerfectIt',
        metricName: 'APILatency',
        dimensionsMap: { Environment: props.environment },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 3000, // 3 seconds
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    latencyAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // Failed Login Attempts Alarm
    const failedLoginAlarm = new cloudwatch.Alarm(this, 'HighFailedLogins', {
      alarmName: `PerfectIt-${props.environment}-FailedLogins`,
      alarmDescription: 'Failed login attempts exceed 50 in 5 minutes',
      metric: new cloudwatch.Metric({
        namespace: 'PerfectIt',
        metricName: 'UserLoginFailed',
        dimensionsMap: { Environment: props.environment },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 50,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    failedLoginAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // Image Processing Failure Alarm
    const imageProcessingAlarm = new cloudwatch.Alarm(this, 'ImageProcessingFailures', {
      alarmName: `PerfectIt-${props.environment}-ImageProcessingFailures`,
      alarmDescription: 'Image processing failures exceed 10 in 15 minutes',
      metric: new cloudwatch.Metric({
        namespace: 'PerfectIt',
        metricName: 'ImageProcessingFailed',
        dimensionsMap: { Environment: props.environment },
        statistic: 'Sum',
        period: cdk.Duration.minutes(15),
      }),
      threshold: 10,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    imageProcessingAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // DynamoDB Throttle Alarm
    const dynamoThrottleAlarm = new cloudwatch.Alarm(this, 'DynamoDBThrottles', {
      alarmName: `PerfectIt-${props.environment}-DynamoDBThrottles`,
      alarmDescription: 'DynamoDB throttles detected',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ConsumedReadCapacityUnits',
        dimensionsMap: {
          TableName: `PerfectIt-${props.environment}-Cards`,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    dynamoThrottleAlarm.addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));
  }
}
```

### Part E: Cost Monitoring

#### Step 7: Cost Tracking and Budgets

**File:** `amplify/backend/monitoring/budgets.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs';

export class CostMonitoring extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      environment: string;
      monthlyBudget: number;
      alertEmail: string;
    }
  ) {
    super(scope, id);

    // Create monthly budget
    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: `PerfectIt-${props.environment}-Monthly`,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: props.monthlyBudget,
          unit: 'USD',
        },
        costFilters: {
          Environment: [props.environment],
        },
        costTypes: {
          includeTax: true,
          includeSubscription: true,
          useBlended: false,
          includeRefund: false,
          includeCredit: false,
          includeUpfront: true,
          includeRecurring: true,
          includeOtherSubscription: true,
          includeSupport: true,
          includeDiscount: true,
          useAmortized: false,
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 80,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: props.alertEmail,
            },
          ],
        },
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: props.alertEmail,
            },
          ],
        },
        {
          notification: {
            notificationType: 'FORECASTED',
            comparisonOperator: 'GREATER_THAN',
            threshold: 120,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: props.alertEmail,
            },
          ],
        },
      ],
    });

    // Service-specific budgets
    const services = ['Lambda', 'DynamoDB', 'S3', 'CloudFront', 'Cognito'];

    services.forEach((service) => {
      new budgets.CfnBudget(this, `${service}Budget`, {
        budget: {
          budgetName: `PerfectIt-${props.environment}-${service}`,
          budgetType: 'COST',
          timeUnit: 'MONTHLY',
          budgetLimit: {
            amount: props.monthlyBudget * 0.3, // 30% of total per service max
            unit: 'USD',
          },
          costFilters: {
            Service: [service],
            Environment: [props.environment],
          },
        },
        notificationsWithSubscribers: [
          {
            notification: {
              notificationType: 'ACTUAL',
              comparisonOperator: 'GREATER_THAN',
              threshold: 100,
              thresholdType: 'PERCENTAGE',
            },
            subscribers: [
              {
                subscriptionType: 'EMAIL',
                address: props.alertEmail,
              },
            ],
          },
        ],
      });
    });
  }
}
```

### Part F: Health Checks and Synthetic Monitoring

#### Step 8: Health Check Endpoints

**File:** `src/app/api/health/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const dynamoClient = new DynamoDBClient({});
const s3Client = new S3Client({});
const cognitoClient = new CognitoIdentityProviderClient({});

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'dev',
    services: {},
  };

  // Check DynamoDB
  try {
    const dynamoStart = Date.now();
    await dynamoClient.send(
      new DescribeTableCommand({
        TableName: process.env.CARDS_TABLE_NAME,
      })
    );
    result.services.dynamodb = {
      status: 'up',
      responseTime: Date.now() - dynamoStart,
    };
  } catch (error) {
    result.services.dynamodb = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    result.status = 'degraded';
  }

  // Check S3
  try {
    const s3Start = Date.now();
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: process.env.S3_BUCKET_NAME,
      })
    );
    result.services.s3 = {
      status: 'up',
      responseTime: Date.now() - s3Start,
    };
  } catch (error) {
    result.services.s3 = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    result.status = 'degraded';
  }

  // Check Cognito
  try {
    const cognitoStart = Date.now();
    await cognitoClient.send(
      new DescribeUserPoolCommand({
        UserPoolId: process.env.USER_POOL_ID,
      })
    );
    result.services.cognito = {
      status: 'up',
      responseTime: Date.now() - cognitoStart,
    };
  } catch (error) {
    result.services.cognito = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    result.status = 'degraded';
  }

  // Check if all critical services are down
  const criticalServices = ['dynamodb', 'cognito'];
  const allCriticalDown = criticalServices.every(
    (service) => result.services[service]?.status === 'down'
  );

  if (allCriticalDown) {
    result.status = 'unhealthy';
  }

  const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 206 : 503;

  return NextResponse.json(result, { status: statusCode });
}
```

## Monitoring Checklist

### Daily Monitoring Tasks

- [ ] Check CloudWatch dashboard for anomalies
- [ ] Review error rate trends
- [ ] Check API latency percentiles
- [ ] Monitor active user count
- [ ] Review any triggered alarms

### Weekly Monitoring Tasks

- [ ] Review cost trends in Cost Explorer
- [ ] Check X-Ray service map for bottlenecks
- [ ] Analyze slow query patterns
- [ ] Review security metrics
- [ ] Update runbooks for new issues

### Monthly Monitoring Tasks

- [ ] Review and adjust alarm thresholds
- [ ] Analyze cost optimization opportunities
- [ ] Update dashboard layouts
- [ ] Review logging retention policies
- [ ] Conduct monitoring system health check

## Acceptance Criteria

### Implementation Complete

- [ ] CloudWatch metrics implemented
- [ ] Dashboard created and configured
- [ ] Structured logging in place
- [ ] X-Ray tracing enabled
- [ ] Critical alarms configured
- [ ] Cost budgets set up
- [ ] Health check endpoints working

### Operational Readiness

- [ ] Team trained on dashboards
- [ ] Alert escalation defined
- [ ] Runbooks documented
- [ ] On-call rotation established
- [ ] Incident response process defined

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Monitoring tested in staging
- [ ] Alarms verified to trigger correctly
- [ ] Documentation complete
- [ ] Team onboarded
- [ ] Costs within budget
- [ ] Performance baselines established
