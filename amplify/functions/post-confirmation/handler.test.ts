import { handler } from './handler';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

process.env.USER_TABLE_NAME = 'test-user-table';

describe('Post-Confirmation Lambda Handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
  });

  const createMockEvent = (overrides = {}): PostConfirmationTriggerEvent => ({
    version: '1',
    region: 'us-east-1',
    userPoolId: 'test-pool-id',
    userName: 'testuser',
    callerContext: {
      awsSdkVersion: '3.x.x',
      clientId: 'test-client-id',
    },
    triggerSource: 'PostConfirmation_ConfirmSignUp',
    request: {
      userAttributes: {
        sub: 'test-user-id-123',
        email: 'test@example.com',
        email_verified: 'true',
        preferred_username: 'TestUser',
        ...overrides,
      },
    },
    response: {},
  });

  it('should create a new user record on successful confirmation', async () => {
    const mockEvent = createMockEvent();

    ddbMock.on(PutCommand).resolves({});

    const result = await handler(mockEvent, {} as any, {} as any);

    expect(result).toEqual(mockEvent);

    const putCalls = ddbMock.commandCalls(PutCommand);
    expect(putCalls).toHaveLength(1);

    const putInput = putCalls[0].args[0].input;
    expect(putInput.TableName).toBe('test-user-table');
    expect(putInput.Item!).toMatchObject({
      id: 'test-user-id-123',
      username: 'TestUser',
      email: 'test@example.com',
      reputationScore: 0,
      isVerified: false,
      expertiseTags: [],
      owner: 'test-user-id-123',
    });
  });

  it('should generate username from email if preferred_username is not provided', async () => {
    const mockEvent = createMockEvent({
      preferred_username: undefined,
    });

    ddbMock.on(PutCommand).resolves({});

    await handler(mockEvent, {} as any, {} as any);

    const putCalls = ddbMock.commandCalls(PutCommand);
    const putInput = putCalls[0].args[0].input;
    expect(putInput.Item!.username).toBe('test');
  });

  it('should generate fallback username if no email or preferred_username', async () => {
    const mockEvent = createMockEvent({
      preferred_username: undefined,
      email: undefined,
    });

    ddbMock.on(PutCommand).resolves({});

    await handler(mockEvent, {} as any, {} as any);

    const putCalls = ddbMock.commandCalls(PutCommand);
    const putInput = putCalls[0].args[0].input;
    expect(putInput.Item!.username).toMatch(/^user_test-use/);
  });

  it('should handle social provider attributes correctly', async () => {
    const mockEvent = createMockEvent({
      picture: 'https://example.com/avatar.jpg',
    });

    ddbMock.on(PutCommand).resolves({});

    await handler(mockEvent, {} as any, {} as any);

    const putCalls = ddbMock.commandCalls(PutCommand);
    const putInput = putCalls[0].args[0].input;
    expect(putInput.Item!.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  it('should handle existing user gracefully', async () => {
    const mockEvent = createMockEvent();

    const conditionalCheckError = new Error('ConditionalCheckFailedException');
    conditionalCheckError.name = 'ConditionalCheckFailedException';
    ddbMock.on(PutCommand).rejects(conditionalCheckError);

    const consoleSpy = jest.spyOn(console, 'log');

    const result = await handler(mockEvent, {} as any, {} as any);

    expect(result).toEqual(mockEvent);
    expect(consoleSpy).toHaveBeenCalledWith('User record already exists, skipping creation');
  });

  it('should throw error if user ID is missing', async () => {
    const mockEvent = createMockEvent();
    mockEvent.request.userAttributes.sub = undefined as any;

    await expect(handler(mockEvent, {} as any, {} as any)).rejects.toThrow('User ID is required');
  });

  it('should propagate DynamoDB errors other than ConditionalCheckFailed', async () => {
    const mockEvent = createMockEvent();

    const dbError = new Error('Internal Server Error');
    ddbMock.on(PutCommand).rejects(dbError);

    await expect(handler(mockEvent, {} as any, {} as any)).rejects.toThrow('Internal Server Error');
  });

  it('should include createdAt and updatedAt timestamps', async () => {
    const mockEvent = createMockEvent();
    const mockDate = '2025-01-08T12:00:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

    ddbMock.on(PutCommand).resolves({});

    await handler(mockEvent, {} as any, {} as any);

    const putCalls = ddbMock.commandCalls(PutCommand);
    const putInput = putCalls[0].args[0].input;
    expect(putInput.Item!.createdAt).toBe(mockDate);
    expect(putInput.Item!.updatedAt).toBe(mockDate);
  });

  it('should set all default values correctly', async () => {
    const mockEvent = createMockEvent();

    ddbMock.on(PutCommand).resolves({});

    await handler(mockEvent, {} as any, {} as any);

    const putCalls = ddbMock.commandCalls(PutCommand);
    const putInput = putCalls[0].args[0].input;

    expect(putInput.Item!).toMatchObject({
      bio: null,
      expertiseTags: [],
      reputationScore: 0,
      isVerified: false,
      socialLinks: null,
    });
  });
});
