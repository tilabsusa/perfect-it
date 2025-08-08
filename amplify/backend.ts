import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { postConfirmation } from './functions/post-confirmation/resource.js';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;

if (cfnUserPool.schema) {
  cfnUserPool.schema.push({
    attributeDataType: 'String',
    name: 'preferred_username',
    mutable: true,
  });
}

backend.postConfirmation.resources.lambda.addEnvironment(
  'USER_TABLE_NAME',
  backend.data.resources.tables['User'].tableName
);

backend.data.resources.tables['User'].grantWriteData(backend.postConfirmation.resources.lambda);
