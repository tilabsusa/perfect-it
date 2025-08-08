# Story 2.2a: Lambda Image Processing Pipeline Setup

## Story Statement
As a developer,  
I want to implement a serverless image processing pipeline using AWS Lambda,  
so that uploaded images are automatically optimized, resized, and distributed via CDN without impacting application performance.

## Dependencies
- Story 1.1: Project initialization complete
- Story 2.1: Data model established
- Story 2.2: S3 bucket configured

## Architecture Overview

```
User Upload → S3 Bucket → S3 Event → Lambda Function → Processed Images → CloudFront CDN
                                            ↓
                                    DynamoDB (metadata)
```

## Implementation Plan

### Part A: Lambda Layer Creation

#### Step 1: Create Sharp Lambda Layer
**File:** `amplify/backend/function/sharp-layer/build-layer.sh`

```bash
#!/bin/bash

# Sharp Lambda Layer Builder Script
# This creates a Lambda layer with Sharp pre-compiled for Amazon Linux 2

echo "Building Sharp Lambda Layer..."

# Clean previous builds
rm -rf nodejs node_modules sharp-layer.zip

# Create directory structure
mkdir -p nodejs

# Install sharp with platform-specific binaries
cd nodejs
npm init -y
npm install sharp@0.33.2 --platform=linux --arch=x64 --libc=glibc

# Remove unnecessary files to reduce size
find . -name "*.md" -delete
find . -name "*.txt" -delete
find . -name "*.yml" -delete
find . -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "example" -type d -exec rm -rf {} + 2>/dev/null || true

cd ..

# Create the layer zip
zip -r sharp-layer.zip nodejs

echo "Layer size: $(du -h sharp-layer.zip | cut -f1)"
echo "Sharp layer created successfully!"

# Upload to S3 for Lambda layer creation
aws s3 cp sharp-layer.zip s3://perfectit-deployment-artifacts/layers/
```

#### Step 2: Deploy Lambda Layer via CDK
**File:** `amplify/backend/function/sharp-layer/resource.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class SharpLambdaLayer extends Construct {
  public readonly layer: lambda.LayerVersion;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create Lambda layer from S3
    this.layer = new lambda.LayerVersion(this, 'SharpLayer', {
      code: lambda.Code.fromBucket(
        s3.Bucket.fromBucketName(this, 'ArtifactsBucket', 'perfectit-deployment-artifacts'),
        'layers/sharp-layer.zip'
      ),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      license: 'Apache-2.0',
      description: 'Sharp image processing library for Lambda',
    });

    // Output the layer ARN for reference
    new cdk.CfnOutput(this, 'SharpLayerArn', {
      value: this.layer.layerVersionArn,
      description: 'ARN of the Sharp Lambda Layer',
      exportName: 'SharpLayerArn'
    });
  }
}
```

### Part B: Lambda Function Implementation

#### Step 3: Create Image Processing Lambda
**File:** `amplify/backend/function/image-processor/handler.ts`

```typescript
import { S3Event, Context, Callback } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as sharp from 'sharp';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface ImageVariant {
  name: string;
  width: number;
  height?: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
}

const IMAGE_VARIANTS: ImageVariant[] = [
  { name: 'thumbnail', width: 150, height: 150, quality: 80, format: 'jpeg' },
  { name: 'small', width: 400, quality: 85, format: 'jpeg' },
  { name: 'medium', width: 800, quality: 85, format: 'jpeg' },
  { name: 'large', width: 1200, quality: 90, format: 'jpeg' },
  { name: 'webp-medium', width: 800, quality: 85, format: 'webp' },
  { name: 'webp-large', width: 1200, quality: 90, format: 'webp' }
];

export const handler = async (event: S3Event, context: Context, callback: Callback) => {
  console.log('Image processing triggered:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    // Skip if already processed (check for variant prefix)
    if (key.includes('/processed/')) {
      console.log('Skipping already processed image:', key);
      continue;
    }

    try {
      // Download original image
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(getCommand);
      
      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      const imageBuffer = await streamToBuffer(response.Body as NodeJS.ReadableStream);
      console.log(`Downloaded image: ${key}, size: ${imageBuffer.length} bytes`);

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      console.log('Image metadata:', metadata);

      // Validate image
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }

      if (imageBuffer.length > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image too large (>10MB)');
      }

      // Process image variants
      const processedImages: Array<{
        key: string;
        size: number;
        width: number;
        height?: number;
        format: string;
      }> = [];

      for (const variant of IMAGE_VARIANTS) {
        try {
          const processedBuffer = await processImage(imageBuffer, variant, metadata);
          const variantKey = generateVariantKey(key, variant.name);
          
          // Upload processed image
          await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: variantKey,
            Body: processedBuffer,
            ContentType: `image/${variant.format}`,
            CacheControl: 'public, max-age=31536000', // 1 year cache
            Metadata: {
              originalKey: key,
              variant: variant.name,
              processedAt: new Date().toISOString()
            }
          }));

          processedImages.push({
            key: variantKey,
            size: processedBuffer.length,
            width: variant.width,
            height: variant.height,
            format: variant.format
          });

          console.log(`Processed variant ${variant.name}: ${variantKey}`);
        } catch (error) {
          console.error(`Failed to process variant ${variant.name}:`, error);
        }
      }

      // Store metadata in DynamoDB
      await storeImageMetadata(key, metadata, processedImages);

      // Generate blur placeholder
      const placeholder = await generateBlurPlaceholder(imageBuffer);
      await storeBlurPlaceholder(key, placeholder);

      console.log(`Successfully processed image: ${key}`);
      
    } catch (error) {
      console.error(`Error processing image ${key}:`, error);
      
      // Send to DLQ or notification
      await handleProcessingError(bucket, key, error as Error);
      
      callback(error as Error);
      return;
    }
  }

  callback(null, 'Processing complete');
};

async function processImage(
  buffer: Buffer, 
  variant: ImageVariant,
  metadata: sharp.Metadata
): Promise<Buffer> {
  let pipeline = sharp(buffer);

  // Auto-rotate based on EXIF
  pipeline = pipeline.rotate();

  // Resize
  if (variant.height) {
    // Crop to exact dimensions
    pipeline = pipeline.resize(variant.width, variant.height, {
      fit: 'cover',
      position: 'center'
    });
  } else {
    // Resize maintaining aspect ratio
    pipeline = pipeline.resize(variant.width, undefined, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Format conversion
  switch (variant.format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ 
        quality: variant.quality,
        progressive: true,
        mozjpeg: true 
      });
      break;
    case 'webp':
      pipeline = pipeline.webp({ 
        quality: variant.quality,
        effort: 4 
      });
      break;
    case 'png':
      pipeline = pipeline.png({ 
        quality: variant.quality,
        compressionLevel: 9 
      });
      break;
  }

  // Add subtle sharpening for display sizes
  if (variant.width >= 800) {
    pipeline = pipeline.sharpen();
  }

  return await pipeline.toBuffer();
}

function generateVariantKey(originalKey: string, variantName: string): string {
  const parts = originalKey.split('/');
  const filename = parts.pop();
  const nameParts = filename!.split('.');
  const extension = nameParts.pop();
  const nameWithoutExt = nameParts.join('.');
  
  // Structure: processed/[variant]/[original-path]/[filename]
  return `processed/${variantName}/${parts.join('/')}/${nameWithoutExt}.${extension}`;
}

async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const placeholder = await sharp(buffer)
    .resize(20, 20, { fit: 'inside' })
    .blur(5)
    .jpeg({ quality: 50 })
    .toBuffer();
  
  return `data:image/jpeg;base64,${placeholder.toString('base64')}`;
}

async function storeImageMetadata(
  key: string,
  metadata: sharp.Metadata,
  processedImages: any[]
) {
  const item = {
    id: key,
    type: 'IMAGE_METADATA',
    originalDimensions: {
      width: metadata.width,
      height: metadata.height
    },
    format: metadata.format,
    size: metadata.size,
    processedVariants: processedImages,
    processedAt: new Date().toISOString(),
    exif: metadata.exif ? JSON.stringify(metadata.exif) : null
  };

  await dynamoClient.send(new PutCommand({
    TableName: process.env.IMAGE_METADATA_TABLE!,
    Item: item
  }));
}

async function storeBlurPlaceholder(key: string, placeholder: string) {
  await dynamoClient.send(new PutCommand({
    TableName: process.env.IMAGE_METADATA_TABLE!,
    Item: {
      id: `${key}#placeholder`,
      type: 'BLUR_PLACEHOLDER',
      data: placeholder,
      createdAt: new Date().toISOString()
    }
  }));
}

async function handleProcessingError(bucket: string, key: string, error: Error) {
  // Log to CloudWatch (automatic)
  console.error('Processing error:', {
    bucket,
    key,
    error: error.message,
    stack: error.stack
  });

  // Store error in DynamoDB for monitoring
  await dynamoClient.send(new PutCommand({
    TableName: process.env.IMAGE_METADATA_TABLE!,
    Item: {
      id: `error#${key}`,
      type: 'PROCESSING_ERROR',
      bucket,
      key,
      error: error.message,
      timestamp: new Date().toISOString(),
      retryCount: 0
    }
  }));

  // TODO: Send SNS notification for critical errors
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```

#### Step 4: Lambda Configuration
**File:** `amplify/backend/function/image-processor/resource.ts`

```typescript
import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';

export const imageProcessor = defineFunction({
  name: 'image-processor',
  runtime: 'nodejs20.x',
  handler: 'handler.handler',
  timeout: Duration.seconds(60),
  memorySize: 2048, // 2GB for image processing
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
    IMAGE_METADATA_TABLE: process.env.IMAGE_METADATA_TABLE!,
    MAX_IMAGE_SIZE: '10485760', // 10MB
    CLOUDFRONT_DISTRIBUTION: process.env.CLOUDFRONT_DISTRIBUTION!
  },
  layers: ['arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:layer:SharpLayer:1']
});
```

### Part C: S3 Event Configuration

#### Step 5: Configure S3 Triggers
**File:** `amplify/backend/storage/resource.ts`

```typescript
import { defineStorage } from '@aws-amplify/backend';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { imageProcessor } from '../function/image-processor/resource';

export const storage = defineStorage({
  name: 'perfectitUploads',
  access: (allow) => ({
    'uploads/*': [
      allow.authenticated.to(['write']),
      allow.guest.to(['read'])
    ],
    'processed/*': [
      allow.guest.to(['read'])
    ]
  })
});

// Add S3 event notification for image uploads
storage.resources.bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(imageProcessor.resources.lambda),
  {
    prefix: 'uploads/',
    suffix: '.jpg'
  }
);

storage.resources.bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(imageProcessor.resources.lambda),
  {
    prefix: 'uploads/',
    suffix: '.jpeg'
  }
);

storage.resources.bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(imageProcessor.resources.lambda),
  {
    prefix: 'uploads/',
    suffix: '.png'
  }
);

storage.resources.bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(imageProcessor.resources.lambda),
  {
    prefix: 'uploads/',
    suffix: '.webp'
  }
);
```

### Part D: Frontend Integration

#### Step 6: Create Image Upload Component with Processing Status
**File:** `src/components/ImageUpload/ProcessingStatus.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface ProcessingStatusProps {
  uploadKey: string;
  onProcessingComplete: (variants: any[]) => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  uploadKey,
  onProcessingComplete
}) => {
  const [status, setStatus] = useState<'processing' | 'complete' | 'error'>('processing');
  const [variants, setVariants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let retries = 0;
    const maxRetries = 30; // 30 seconds timeout
    const pollInterval = 1000; // 1 second

    const checkProcessingStatus = async () => {
      try {
        const response = await client.models.ImageMetadata.get({ id: uploadKey });
        
        if (response.data?.processedVariants && response.data.processedVariants.length > 0) {
          setStatus('complete');
          setVariants(response.data.processedVariants);
          setProgress(100);
          onProcessingComplete(response.data.processedVariants);
          return true;
        }

        // Check for processing error
        const errorResponse = await client.models.ImageMetadata.get({ 
          id: `error#${uploadKey}` 
        });
        
        if (errorResponse.data) {
          setStatus('error');
          setError(errorResponse.data.error || 'Processing failed');
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error checking processing status:', err);
        return false;
      }
    };

    const poll = setInterval(async () => {
      retries++;
      setProgress((retries / maxRetries) * 100);

      const isComplete = await checkProcessingStatus();
      
      if (isComplete || retries >= maxRetries) {
        clearInterval(poll);
        
        if (retries >= maxRetries && status === 'processing') {
          setStatus('error');
          setError('Processing timeout - please try again');
        }
      }
    }, pollInterval);

    // Initial check
    checkProcessingStatus();

    return () => clearInterval(poll);
  }, [uploadKey, onProcessingComplete]);

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      {status === 'processing' && (
        <>
          <CircularProgress variant="determinate" value={progress} size={60} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Processing image... {Math.round(progress)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Creating optimized versions for web display
          </Typography>
        </>
      )}

      {status === 'complete' && (
        <>
          <CheckCircle color="success" sx={{ fontSize: 60 }} />
          <Typography variant="body2" sx={{ mt: 2 }} color="success.main">
            Image processed successfully!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {variants.length} variants created
          </Typography>
        </>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}
    </Box>
  );
};
```

### Part E: Testing & Monitoring

#### Step 7: Lambda Testing Script
**File:** `scripts/test-image-processing.js`

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({ region: 'us-east-1' });

async function testImageUpload() {
  const testImages = [
    { file: 'test-small.jpg', size: '500KB' },
    { file: 'test-medium.jpg', size: '2MB' },
    { file: 'test-large.jpg', size: '8MB' },
    { file: 'test-portrait.jpg', size: '1MB' },
    { file: 'test-landscape.jpg', size: '1MB' }
  ];

  for (const testImage of testImages) {
    const imagePath = path.join(__dirname, '../test-data/images', testImage.file);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  Test image not found: ${testImage.file}`);
      continue;
    }

    const fileContent = fs.readFileSync(imagePath);
    const key = `uploads/test/${Date.now()}-${testImage.file}`;

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || 'perfectit-uploads-dev',
        Key: key,
        Body: fileContent,
        ContentType: 'image/jpeg'
      }));

      console.log(`✅ Uploaded test image: ${key} (${testImage.size})`);
      
      // Wait and check processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // TODO: Check if processed variants exist
      
    } catch (error) {
      console.error(`❌ Failed to upload ${testImage.file}:`, error);
    }
  }
}

testImageUpload();
```

#### Step 8: CloudWatch Monitoring
**File:** `amplify/backend/monitoring/image-processing-alarms.ts`

```typescript
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Duration } from 'aws-cdk-lib';

export function createImageProcessingAlarms(
  lambdaFunction: lambda.Function,
  alarmTopic: sns.Topic
) {
  // Error rate alarm
  new cloudwatch.Alarm(stack, 'ImageProcessingErrorAlarm', {
    metric: lambdaFunction.metricErrors({
      period: Duration.minutes(5)
    }),
    threshold: 5,
    evaluationPeriods: 1,
    alarmDescription: 'Image processing Lambda error rate too high',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
  }).addAlarmAction(new actions.SnsAction(alarmTopic));

  // Duration alarm
  new cloudwatch.Alarm(stack, 'ImageProcessingDurationAlarm', {
    metric: lambdaFunction.metricDuration({
      period: Duration.minutes(5),
      statistic: 'Average'
    }),
    threshold: 30000, // 30 seconds
    evaluationPeriods: 2,
    alarmDescription: 'Image processing taking too long',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
  }).addAlarmAction(new actions.SnsAction(alarmTopic));

  // Throttles alarm
  new cloudwatch.Alarm(stack, 'ImageProcessingThrottleAlarm', {
    metric: lambdaFunction.metricThrottles({
      period: Duration.minutes(5)
    }),
    threshold: 1,
    evaluationPeriods: 1,
    alarmDescription: 'Image processing Lambda being throttled',
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
  }).addAlarmAction(new actions.SnsAction(alarmTopic));
}
```

## Performance Optimization

### Image Processing Best Practices
1. **Memory Allocation:** 2048MB provides best price/performance for Sharp
2. **Concurrent Executions:** Set reserved concurrency to prevent throttling
3. **S3 Transfer Acceleration:** Enable for faster uploads from users
4. **CloudFront Caching:** Cache processed images for 1 year
5. **Progressive Enhancement:** Generate WebP for modern browsers

### Cost Optimization
- Process on-demand, not pre-generate all variants
- Use S3 Intelligent-Tiering for infrequently accessed images
- Set lifecycle policies to delete old processed variants
- Monitor Lambda costs and adjust memory/timeout as needed

## Acceptance Criteria

### Technical Requirements
- [ ] Sharp Lambda layer deployed successfully
- [ ] Image processing Lambda function deployed
- [ ] S3 event triggers configured
- [ ] All image variants generated correctly
- [ ] Blur placeholders created
- [ ] Metadata stored in DynamoDB
- [ ] CloudWatch alarms configured

### Performance Requirements
- [ ] Images processed within 10 seconds (95th percentile)
- [ ] Lambda cold start under 3 seconds
- [ ] Error rate below 1%
- [ ] Support for images up to 10MB

### Quality Requirements
- [ ] EXIF orientation handled correctly
- [ ] Image quality acceptable for all variants
- [ ] WebP variants for modern browser support
- [ ] Graceful error handling

## Rollback Plan

If image processing fails:
1. Disable S3 event triggers
2. Fall back to client-side resizing (temporary)
3. Process images manually via script
4. Fix issues in development
5. Re-enable when stable

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Sharp binary incompatible | Rebuild layer on Amazon Linux 2 |
| Lambda timeout | Increase timeout to 60s, optimize code |
| Memory errors | Increase Lambda memory to 3008MB |
| S3 event not triggering | Check bucket notification configuration |
| Processed images not accessible | Verify S3 bucket CORS and policies |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Image processing tested with various formats/sizes
- [ ] Performance metrics within targets
- [ ] Monitoring and alarms functional
- [ ] Documentation complete
- [ ] Cost analysis completed
- [ ] Team trained on troubleshooting