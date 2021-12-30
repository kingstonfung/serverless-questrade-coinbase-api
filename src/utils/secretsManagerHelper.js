const aws = require('aws-sdk');

module.exports.getSecretValue = secretId => {
  const secretsManager = new aws.SecretsManager({ region: process.env.AWS_REGION });
  const promise = secretsManager.getSecretValue({ SecretId: secretId }).promise();

  return promise;
}
