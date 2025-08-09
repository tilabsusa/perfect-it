# Story 4.6: Content Moderation System

## Story Statement

As a platform owner,  
I want an automated and manual content moderation system,  
so that we can maintain content quality, prevent abuse, and ensure a safe environment for all users while complying with legal requirements.

## Priority: HIGH

This story is critical for platform safety and should be implemented before public launch.

## Moderation Architecture

```
User Content → Auto-Moderation → Risk Score → Decision
                     ↓                ↓           ↓
                AWS Rekognition   AI Text    Manual Queue
                     ↓              Analysis       ↓
                Image Safety    Profanity    Moderator Dashboard
                     ↓           Toxicity         ↓
                  Blocked       Hate Speech    Actions
                                    ↓
                              Flagged/Approved
```

## Implementation Plan

### Part A: Content Moderation Data Model

#### Step 1: Define Moderation Schema

**File:** `amplify/data/moderation-schema.graphql`

```graphql
type ModerationReport
  @model
  @auth(
    rules: [
      { allow: private, operations: [read] }
      { allow: groups, groups: ["moderator", "admin"] }
    ]
  ) {
  id: ID!
  contentId: String! @index(name: "byContent")
  contentType: ContentType!
  reporterId: String @index(name: "byReporter")
  reporterEmail: String
  reason: ReportReason!
  description: String
  status: ModerationStatus! @index(name: "byStatus")
  priority: Priority!
  assignedTo: String @index(name: "byAssignee")
  reviewedAt: AWSDateTime
  reviewedBy: String
  decision: ModerationDecision
  notes: String
  autoModerationScore: Float
  autoModerationFlags: [String]
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type ContentFlag
  @model
  @auth(
    rules: [
      { allow: private, operations: [read] }
      { allow: groups, groups: ["moderator", "admin"] }
    ]
  ) {
  id: ID!
  contentId: String! @index(name: "byContent")
  contentType: ContentType!
  flagType: FlagType!
  confidence: Float!
  details: AWSJSON
  source: String! # "rekognition", "comprehend", "manual", "community"
  isActive: Boolean!
  createdAt: AWSDateTime!
}

type BannedContent @model @auth(rules: [{ allow: groups, groups: ["moderator", "admin"] }]) {
  id: ID!
  pattern: String! @index(name: "byPattern")
  type: BanType! # "word", "phrase", "regex", "image_hash"
  severity: Severity!
  reason: String!
  addedBy: String!
  isActive: Boolean!
  createdAt: AWSDateTime!
}

type ModeratorAction @model @auth(rules: [{ allow: groups, groups: ["moderator", "admin"] }]) {
  id: ID!
  moderatorId: String! @index(name: "byModerator")
  contentId: String! @index(name: "byContent")
  action: ActionType!
  reason: String
  timestamp: AWSDateTime!
  metadata: AWSJSON
}

enum ContentType {
  CARD
  COMMENT
  USER_PROFILE
  IMAGE
}

enum ReportReason {
  INAPPROPRIATE_CONTENT
  SPAM
  HARASSMENT
  COPYRIGHT_VIOLATION
  MISINFORMATION
  DANGEROUS_CONTENT
  OTHER
}

enum ModerationStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
  ESCALATED
  AUTO_APPROVED
  AUTO_REJECTED
}

enum ModerationDecision {
  APPROVE
  REMOVE
  EDIT_REQUIRED
  WARNING_ISSUED
  USER_BANNED
  NO_ACTION
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum FlagType {
  PROFANITY
  TOXICITY
  HATE_SPEECH
  VIOLENCE
  ADULT_CONTENT
  SPAM
  PII_EXPOSED
  COPYRIGHT
}

enum BanType {
  WORD
  PHRASE
  REGEX
  IMAGE_HASH
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ActionType {
  APPROVE
  REJECT
  EDIT
  DELETE
  WARN_USER
  BAN_USER
  ESCALATE
  UNFLAG
}
```

### Part B: Automated Content Moderation

#### Step 2: Text Moderation with AWS Comprehend

**File:** `amplify/backend/function/text-moderation/handler.ts`

```typescript
import {
  ComprehendClient,
  DetectToxicContentCommand,
  DetectPiiEntitiesCommand,
  DetectSentimentCommand,
} from '@aws-sdk/client-comprehend';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const comprehendClient = new ComprehendClient({ region: process.env.AWS_REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface TextModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  details: any;
  requiresManualReview: boolean;
}

// Custom profanity list (supplement AWS)
const PROFANITY_LIST = new Set([
  // Add custom blocked words/phrases here
  // This list would be loaded from DynamoDB in production
]);

const TOXIC_THRESHOLD = 0.7;
const PII_THRESHOLD = 0.8;
const NEGATIVE_SENTIMENT_THRESHOLD = 0.9;

export async function moderateText(
  text: string,
  contentId: string,
  contentType: string
): Promise<TextModerationResult> {
  const result: TextModerationResult = {
    isApproved: true,
    confidence: 1.0,
    flags: [],
    details: {},
    requiresManualReview: false,
  };

  try {
    // 1. Check custom profanity list
    const profanityCheck = checkProfanity(text);
    if (profanityCheck.found) {
      result.flags.push('PROFANITY');
      result.isApproved = false;
      result.details.profanity = profanityCheck.matches;
    }

    // 2. AWS Comprehend Toxicity Detection
    const toxicityResponse = await comprehendClient.send(
      new DetectToxicContentCommand({
        TextSegments: [{ Text: text }],
        LanguageCode: 'en',
      })
    );

    if (toxicityResponse.ResultList?.[0]) {
      const toxicity = toxicityResponse.ResultList[0];
      const toxicLabels = toxicity.Labels?.filter((label) => (label.Score || 0) > TOXIC_THRESHOLD);

      if (toxicLabels && toxicLabels.length > 0) {
        result.flags.push('TOXICITY');
        result.isApproved = false;
        result.confidence = Math.min(result.confidence, 1 - (toxicLabels[0].Score || 0));
        result.details.toxicity = toxicLabels.map((l) => ({
          name: l.Name,
          score: l.Score,
        }));
      }
    }

    // 3. PII Detection
    const piiResponse = await comprehendClient.send(
      new DetectPiiEntitiesCommand({
        Text: text,
        LanguageCode: 'en',
      })
    );

    if (piiResponse.Entities && piiResponse.Entities.length > 0) {
      const highConfidencePII = piiResponse.Entities.filter(
        (entity) => (entity.Score || 0) > PII_THRESHOLD
      );

      if (highConfidencePII.length > 0) {
        result.flags.push('PII_EXPOSED');
        result.requiresManualReview = true;
        result.details.pii = highConfidencePII.map((e) => ({
          type: e.Type,
          score: e.Score,
        }));
      }
    }

    // 4. Sentiment Analysis (for harassment detection)
    const sentimentResponse = await comprehendClient.send(
      new DetectSentimentCommand({
        Text: text,
        LanguageCode: 'en',
      })
    );

    if (
      sentimentResponse.Sentiment === 'NEGATIVE' &&
      (sentimentResponse.SentimentScore?.Negative || 0) > NEGATIVE_SENTIMENT_THRESHOLD
    ) {
      result.flags.push('NEGATIVE_SENTIMENT');
      result.requiresManualReview = true;
      result.details.sentiment = {
        sentiment: sentimentResponse.Sentiment,
        scores: sentimentResponse.SentimentScore,
      };
    }

    // 5. Spam Detection (custom implementation)
    const spamScore = detectSpam(text);
    if (spamScore > 0.7) {
      result.flags.push('SPAM');
      result.isApproved = false;
      result.details.spam = { score: spamScore };
    }

    // Store moderation results
    await storeModerationResult(contentId, contentType, result);
  } catch (error) {
    console.error('Text moderation error:', error);
    // On error, flag for manual review
    result.requiresManualReview = true;
    result.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

function checkProfanity(text: string): { found: boolean; matches: string[] } {
  const normalizedText = text.toLowerCase();
  const matches: string[] = [];

  for (const word of PROFANITY_LIST) {
    if (normalizedText.includes(word)) {
      matches.push(word);
    }
  }

  return { found: matches.length > 0, matches };
}

function detectSpam(text: string): number {
  let spamScore = 0;

  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5) spamScore += 0.3;

  // Check for excessive punctuation
  const punctuationRatio = (text.match(/[!?]{2,}/g) || []).length;
  if (punctuationRatio > 3) spamScore += 0.2;

  // Check for repeated characters
  const repeatedChars = text.match(/(.)\1{4,}/g);
  if (repeatedChars) spamScore += 0.2;

  // Check for suspicious URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern) || [];
  if (urls.length > 2) spamScore += 0.3;

  // Check for common spam phrases
  const spamPhrases = [
    'click here',
    'buy now',
    'limited time',
    'act now',
    'make money',
    'work from home',
    'congratulations you won',
  ];

  for (const phrase of spamPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      spamScore += 0.2;
      break;
    }
  }

  return Math.min(spamScore, 1.0);
}

async function storeModerationResult(
  contentId: string,
  contentType: string,
  result: TextModerationResult
) {
  for (const flag of result.flags) {
    await dynamoClient.send(
      new PutCommand({
        TableName: process.env.CONTENT_FLAGS_TABLE!,
        Item: {
          id: `${contentId}-${flag}-${Date.now()}`,
          contentId,
          contentType,
          flagType: flag,
          confidence: result.confidence,
          details: result.details,
          source: 'comprehend',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }
}
```

#### Step 3: Image Moderation with AWS Rekognition

**File:** `amplify/backend/function/image-moderation/handler.ts`

```typescript
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectTextCommand,
  DetectFacesCommand,
} from '@aws-sdk/client-rekognition';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

interface ImageModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  details: any;
  requiresManualReview: boolean;
  imageHash: string;
}

const MODERATION_THRESHOLD = 0.7;
const BLOCKED_LABELS = [
  'Explicit Nudity',
  'Violence',
  'Weapons',
  'Hate Symbols',
  'Drugs',
  'Tobacco',
  'Alcohol', // May want to adjust based on context
];

export async function moderateImage(
  bucket: string,
  key: string,
  contentId: string
): Promise<ImageModerationResult> {
  const result: ImageModerationResult = {
    isApproved: true,
    confidence: 1.0,
    flags: [],
    details: {},
    requiresManualReview: false,
    imageHash: '',
  };

  try {
    // Get image from S3 for hash calculation
    const getObjectResponse = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    if (getObjectResponse.Body) {
      const imageBuffer = await streamToBuffer(getObjectResponse.Body as NodeJS.ReadableStream);
      result.imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

      // Check if image hash is banned
      const isBanned = await checkBannedImageHash(result.imageHash);
      if (isBanned) {
        result.isApproved = false;
        result.flags.push('BANNED_IMAGE');
        return result;
      }
    }

    // 1. Detect moderation labels
    const moderationResponse = await rekognitionClient.send(
      new DetectModerationLabelsCommand({
        Image: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
        MinConfidence: MODERATION_THRESHOLD * 100,
      })
    );

    if (moderationResponse.ModerationLabels && moderationResponse.ModerationLabels.length > 0) {
      for (const label of moderationResponse.ModerationLabels) {
        if (BLOCKED_LABELS.includes(label.Name || '')) {
          result.isApproved = false;
          result.flags.push(label.Name?.toUpperCase().replace(/ /g, '_') || 'UNKNOWN');
          result.confidence = Math.min(result.confidence, 1 - (label.Confidence || 0) / 100);
        }

        // Add to details for review
        if (!result.details.moderationLabels) {
          result.details.moderationLabels = [];
        }
        result.details.moderationLabels.push({
          name: label.Name,
          confidence: label.Confidence,
          parentName: label.ParentName,
        });
      }
    }

    // 2. Detect text in images (for profanity, hate speech)
    const textResponse = await rekognitionClient.send(
      new DetectTextCommand({
        Image: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
      })
    );

    if (textResponse.TextDetections && textResponse.TextDetections.length > 0) {
      const detectedText = textResponse.TextDetections.map((t) => t.DetectedText)
        .filter(Boolean)
        .join(' ');

      // Run text through text moderation
      const textModResult = await moderateText(detectedText, contentId, 'IMAGE_TEXT');

      if (!textModResult.isApproved) {
        result.isApproved = false;
        result.flags.push(...textModResult.flags.map((f) => `TEXT_${f}`));
        result.details.textInImage = {
          text: detectedText,
          moderation: textModResult,
        };
      }
    }

    // 3. Detect faces for privacy concerns
    const facesResponse = await rekognitionClient.send(
      new DetectFacesCommand({
        Image: {
          S3Object: {
            Bucket: bucket,
            Name: key,
          },
        },
        Attributes: ['ALL'],
      })
    );

    if (facesResponse.FaceDetails && facesResponse.FaceDetails.length > 3) {
      // Flag if many faces detected (potential privacy issue)
      result.requiresManualReview = true;
      result.details.faceCount = facesResponse.FaceDetails.length;
      result.flags.push('MULTIPLE_FACES');
    }

    // Check for children in images
    const hasChildren = facesResponse.FaceDetails?.some(
      (face) => face.AgeRange && face.AgeRange.High && face.AgeRange.High < 18
    );

    if (hasChildren) {
      result.requiresManualReview = true;
      result.flags.push('POTENTIAL_MINOR');
    }

    // Store moderation results
    await storeImageModerationResult(contentId, result);
  } catch (error) {
    console.error('Image moderation error:', error);
    result.requiresManualReview = true;
    result.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

async function checkBannedImageHash(hash: string): Promise<boolean> {
  // Check against database of banned image hashes
  // This would query DynamoDB for banned content
  return false; // Placeholder
}

async function storeImageModerationResult(contentId: string, result: ImageModerationResult) {
  // Store in DynamoDB for audit trail
  // Implementation similar to text moderation storage
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Import text moderation function
import { moderateText } from '../text-moderation/handler';
```

### Part C: Manual Moderation Dashboard

#### Step 4: Moderator Dashboard UI

**File:** `src/app/moderator/dashboard/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Flag as FlagIcon,
  CheckCircle,
  Cancel,
  Edit,
  Warning,
  Block,
  Visibility,
  EscalatorWarning,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface ModerationQueue {
  pending: ModerationItem[];
  inReview: ModerationItem[];
  escalated: ModerationItem[];
}

interface ModerationItem {
  id: string;
  contentId: string;
  contentType: string;
  reportReason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoFlags: string[];
  reportCount: number;
  createdAt: string;
  content: any;
}

export default function ModeratorDashboard() {
  const [tab, setTab] = useState(0);
  const [queue, setQueue] = useState<ModerationQueue>({
    pending: [],
    inReview: [],
    escalated: [],
  });
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModerationQueue();
  }, [tab]);

  const loadModerationQueue = async () => {
    setLoading(true);
    try {
      const status = ['PENDING', 'IN_REVIEW', 'ESCALATED'][tab];
      const response = await client.models.ModerationReport.list({
        filter: { status: { eq: status } },
        limit: 100,
      });

      const items = await Promise.all(
        response.data.map(async (report) => {
          // Load content details based on type
          const content = await loadContent(report.contentId, report.contentType);
          return {
            id: report.id,
            contentId: report.contentId,
            contentType: report.contentType,
            reportReason: report.reason,
            priority: report.priority,
            autoFlags: report.autoModerationFlags || [],
            reportCount: 1, // Would aggregate in production
            createdAt: report.createdAt,
            content,
          };
        })
      );

      setQueue(prev => ({
        ...prev,
        [['pending', 'inReview', 'escalated'][tab]]: items,
      }));
    } catch (error) {
      console.error('Error loading moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (contentId: string, contentType: string) => {
    // Load actual content based on type
    switch (contentType) {
      case 'CARD':
        const card = await client.models.PerfectionCard.get({ id: contentId });
        return card.data;
      case 'COMMENT':
        const comment = await client.models.Comment.get({ id: contentId });
        return comment.data;
      default:
        return null;
    }
  };

  const handleAction = async (action: string) => {
    if (!selectedItem) return;

    try {
      // Update moderation report
      await client.models.ModerationReport.update({
        id: selectedItem.id,
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        decision: action,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'current-moderator-id', // Get from auth
        notes,
      });

      // Log moderator action
      await client.models.ModeratorAction.create({
        moderatorId: 'current-moderator-id',
        contentId: selectedItem.contentId,
        action,
        reason: notes,
        timestamp: new Date().toISOString(),
      });

      // Handle content based on action
      if (action === 'DELETE') {
        await deleteContent(selectedItem.contentId, selectedItem.contentType);
      } else if (action === 'BAN_USER') {
        await banUser(selectedItem.content.authorId);
      }

      // Refresh queue
      await loadModerationQueue();
      setActionDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error performing moderation action:', error);
    }
  };

  const deleteContent = async (contentId: string, contentType: string) => {
    switch (contentType) {
      case 'CARD':
        await client.models.PerfectionCard.delete({ id: contentId });
        break;
      case 'COMMENT':
        await client.models.Comment.delete({ id: contentId });
        break;
    }
  };

  const banUser = async (userId: string) => {
    // Implement user banning logic
    console.log('Banning user:', userId);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'default',
      MEDIUM: 'warning',
      HIGH: 'error',
      CRITICAL: 'error',
    };
    return colors[priority as keyof typeof colors] as any;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Moderation Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Review
              </Typography>
              <Typography variant="h3">
                <Badge badgeContent={queue.pending.length} color="error">
                  <FlagIcon />
                </Badge>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Review
              </Typography>
              <Typography variant="h3">
                {queue.inReview.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Escalated
              </Typography>
              <Typography variant="h3">
                <Badge badgeContent={queue.escalated.length} color="error">
                  <EscalatorWarning />
                </Badge>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Reviewed Today
              </Typography>
              <Typography variant="h3">42</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Pending" />
          <Tab label="In Review" />
          <Tab label="Escalated" />
        </Tabs>
      </Paper>

      <DataGrid
        rows={queue[['pending', 'inReview', 'escalated'][tab] as keyof ModerationQueue]}
        columns={[
          { field: 'contentType', headerName: 'Type', width: 100 },
          { field: 'reportReason', headerName: 'Reason', width: 200 },
          {
            field: 'priority',
            headerName: 'Priority',
            width: 100,
            renderCell: (params) => (
              <Chip
                label={params.value}
                color={getPriorityColor(params.value)}
                size="small"
              />
            ),
          },
          {
            field: 'autoFlags',
            headerName: 'Auto Flags',
            width: 200,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {params.value.map((flag: string) => (
                  <Chip key={flag} label={flag} size="small" />
                ))}
              </Box>
            ),
          },
          { field: 'reportCount', headerName: 'Reports', width: 100 },
          { field: 'createdAt', headerName: 'Submitted', width: 150 },
          {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
              <Box>
                <Tooltip title="View Content">
                  <IconButton
                    size="small"
                    onClick={() => setSelectedItem(params.row)}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedItem(params.row);
                      setDecision('APPROVE');
                      setActionDialog(true);
                    }}
                  >
                    <CheckCircle />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedItem(params.row);
                      setDecision('REJECT');
                      setActionDialog(true);
                    }}
                  >
                    <Cancel />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Escalate">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => {
                      setSelectedItem(params.row);
                      setDecision('ESCALATE');
                      setActionDialog(true);
                    }}
                  >
                    <EscalatorWarning />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ]}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        loading={loading}
        autoHeight
      />

      {/* Action Dialog */}
      <Dialog
        open={actionDialog}
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Moderation Action
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Decision</InputLabel>
            <Select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              label="Decision"
            >
              <MenuItem value="APPROVE">Approve</MenuItem>
              <MenuItem value="REJECT">Reject & Remove</MenuItem>
              <MenuItem value="EDIT_REQUIRED">Require Edit</MenuItem>
              <MenuItem value="WARNING">Issue Warning</MenuItem>
              <MenuItem value="BAN_USER">Ban User</MenuItem>
              <MenuItem value="ESCALATE">Escalate</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setActionDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleAction(decision)}
              color={decision === 'APPROVE' ? 'success' : 'error'}
            >
              Confirm Action
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
```

### Part D: User Reporting System

#### Step 5: Report Content Component

**File:** `src/components/ReportContent/ReportDialog.tsx`

```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  Typography,
} from '@mui/material';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'CARD' | 'COMMENT' | 'USER_PROFILE';
  contentTitle?: string;
}

const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate or offensive content' },
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'COPYRIGHT_VIOLATION', label: 'Copyright violation' },
  { value: 'MISINFORMATION', label: 'False or misleading information' },
  { value: 'DANGEROUS_CONTENT', label: 'Dangerous or harmful content' },
  { value: 'OTHER', label: 'Other' },
];

export const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  contentId,
  contentType,
  contentTitle,
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create moderation report
      await client.models.ModerationReport.create({
        contentId,
        contentType,
        reason,
        description,
        status: 'PENDING',
        priority: getPriority(reason),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Auto-moderate if certain keywords detected
      if (shouldAutoModerate(reason, description)) {
        await triggerAutoModeration(contentId, contentType);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriority = (reason: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    const highPriority = ['DANGEROUS_CONTENT', 'HARASSMENT', 'COPYRIGHT_VIOLATION'];
    const mediumPriority = ['INAPPROPRIATE_CONTENT', 'MISINFORMATION'];

    if (highPriority.includes(reason)) return 'HIGH';
    if (mediumPriority.includes(reason)) return 'MEDIUM';
    return 'LOW';
  };

  const shouldAutoModerate = (reason: string, description: string): boolean => {
    // Trigger auto-moderation for high-priority reports
    const autoModerateReasons = ['DANGEROUS_CONTENT', 'HARASSMENT'];
    return autoModerateReasons.includes(reason);
  };

  const triggerAutoModeration = async (contentId: string, contentType: string) => {
    // Trigger Lambda function for immediate moderation
    // This would call the moderation Lambda functions
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Report Content
        {contentTitle && (
          <Typography variant="body2" color="text.secondary">
            {contentTitle}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thank you for your report. We'll review it as soon as possible.
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Help us understand what's wrong with this content. Reports are anonymous.
        </Typography>

        <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
          {REPORT_REASONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>

        {reason === 'OTHER' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Please describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        )}

        {reason && reason !== 'OTHER' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={submitting || !reason || (reason === 'OTHER' && !description)}
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Moderation Policies & Guidelines

### Content Guidelines

1. **Prohibited Content:**

   - Explicit adult content
   - Violence or gore
   - Hate speech or discrimination
   - Harassment or bullying
   - Dangerous instructions that could cause harm
   - Copyright violations
   - Personal information (PII)

2. **Restricted Content:**

   - Alcohol/tobacco (context-dependent)
   - Political content (monitored)
   - Medical advice (requires disclaimer)

3. **Quality Standards:**
   - Clear, helpful instructions
   - Accurate information
   - Appropriate language
   - Relevant images

### Moderation Workflow

1. **Automated Review:** All content passes through automated checks
2. **Risk Scoring:** Content assigned risk score based on flags
3. **Queue Assignment:** High-risk content prioritized for review
4. **Manual Review:** Moderators review flagged content
5. **Action Decision:** Approve, edit, remove, or ban
6. **Appeals Process:** Users can appeal moderation decisions

## Acceptance Criteria

### Technical Implementation

- [ ] Moderation data models created
- [ ] Text moderation with AWS Comprehend working
- [ ] Image moderation with AWS Rekognition working
- [ ] Moderator dashboard functional
- [ ] User reporting system implemented
- [ ] Auto-moderation triggers configured
- [ ] Moderation metrics tracked

### Operational Readiness

- [ ] Moderation guidelines documented
- [ ] Moderator training completed
- [ ] Escalation process defined
- [ ] Response time SLAs established
- [ ] Appeals process documented

### Compliance

- [ ] COPPA compliance for minors
- [ ] DMCA process for copyright
- [ ] Data retention policies defined
- [ ] Audit trail maintained

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Moderation tested with various content types
- [ ] False positive rate <5%
- [ ] Average moderation time <2 hours
- [ ] Documentation complete
- [ ] Moderator team trained
- [ ] Legal review completed
