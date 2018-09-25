'use strict';

var AWS = require('aws-sdk');

const uuidV4 = require('uuid/v4');

var db = new AWS.DynamoDB.DocumentClient();



module.exports.handler = async (event, context, callback) => {

  console.log(event);

  event.Records.forEach((record) => {
      var audit = new Audit( record );
      await audit.insert(audit);
      console.log(audit);
  });

  callback(null, `Successfully processed ${event.Records.length} records`)

  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

class Audit
{
  constructor(object)
  {

      this.AuditId = uuidV4();
      var today = new Date();
      this.timestamp = today.toJSON();
      this.object = object;

  }


  insert(item)
  {
    return new Promise (function (resolve, reject )
    {
      var AuditTable =
      {
          TableName:"Audit",
          Item: item
      };

      db.put(AuditTable, function(err, returndata)
      {
        if (err)
        {
            reject(err);
        }
        else
        {
          console.log( `Audit operation result : ${returndata}`);
          resolve(item);
        }
      });
    });
  }
}
