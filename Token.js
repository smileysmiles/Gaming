'use strict';

//var AWS = require('aws-sdk');

const uuidV4 = require('uuid/v4');

//var db = new AWS.DynamoDB.DocumentClient();

class Token
{
  static CreateTokenId()
  {
    return uuidV4();
  }
}

module.exports = Token
