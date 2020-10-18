const aws = require('aws-sdk');

const getObject = (bucket, key) => new aws.S3().getObject({
  Bucket: bucket,
  Key: key,
}).promise();

const deleteObject = (bucket, key) => new aws.S3().deleteObject({
  Bucket: bucket,
  Key: key,
}).promise();

const putObject = (body, bucket, key) => new aws.S3().putObject({
  ContentType: 'application/json',
  Body: body,
  Bucket: bucket,
  Key: key,
}).promise();

module.exports = { getObject, putObject, deleteObject };
