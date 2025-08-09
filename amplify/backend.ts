import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';

const backend = defineBackend({
  auth,
  data,
});

// const { cfnUserPool } = backend.auth.resources.cfnResources;

// if (Array.isArray(cfnUserPool.schema)) {
//   cfnUserPool.schema.push({
//     attributeDataType: 'String',
//     name: 'preferred_username',
//     mutable: true,
//   });
// }
