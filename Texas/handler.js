'use strict';

var AWS = require('aws-sdk');

var db = new AWS.DynamoDB.DocumentClient();



module.exports.getaccount = async (event, context) => {

  console.log(event);

  var body = JSON.parse(event.body);

  var params = {
    Table: "Customer"
    Key:{
      "CustomerID":{S: body.customerid}
    }
  }

  var customer = null;

  db.getItem(params, function (err, data){
    if (err) console.log( err, err.stack);
    else customer = data;
  });

  return {
    statusCode: 200,
    body: JSON.stringify( customer )
  };

  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
