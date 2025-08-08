import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    const { userAttributes } = event.request;
    const userId = event.request.userAttributes.sub;

    if (!userId) {
      console.error('No user ID found in event');
      throw new Error('User ID is required');
    }

    const username =
      userAttributes.preferred_username ||
      userAttributes.email?.split('@')[0] ||
      `user_${userId.substring(0, 8)}`;

    const now = new Date().toISOString();

    const userRecord = {
      id: userId,
      username: username,
      email: userAttributes.email || null,
      avatarUrl: userAttributes.picture || null,
      bio: null,
      expertiseTags: [],
      reputationScore: 0,
      isVerified: false,
      socialLinks: null,
      createdAt: now,
      updatedAt: now,
      owner: userId,
    };

    const putCommand = new PutCommand({
      TableName: process.env.USER_TABLE_NAME,
      Item: userRecord,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    await docClient.send(putCommand);

    console.log(`Successfully created user record for ${userId}`);

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);

    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      console.log('User record already exists, skipping creation');
      return event;
    }

    throw error;
  }
};
