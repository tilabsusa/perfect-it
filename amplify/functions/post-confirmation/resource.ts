import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  environment: {
    USER_TABLE_NAME: {
      value: 'User',
    },
  },
  timeoutSeconds: 30,
  memoryMB: 256,
});
