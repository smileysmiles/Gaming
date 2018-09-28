'use strict';

var AWS = require('aws-sdk');

var Token = require('../Token.js');

var db = new AWS.DynamoDB.DocumentClient();


module.exports.handler = async (event, context) => {

  switch (event.provider)
  {
    case "NYX":
      this.provider = new NYXProcessor( event );
      break;
  }

  var response = await this.provider.execute();
  console.log( response );

  return {
    statusCode: 200,
    body: JSON.stringify( response )
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


class NYXProcessor
{
  constructor ( event )
  {
    this.event = event;
  }

  execute()
  {
    let response;

    switch (this.event.request)
    {
      case "getaccount":
        response = this.getaccount();
        break;
      case "getbalance":
        response = this.getbalance();
        break;
      case "ping":
        response = this.ping();
        break;
      case "wager":
        response = this.wager();
        break;
      case "result":
        response = this.result();
        break;
      default:
        response = this.event;
    }

    return response;
  }

  // ************************************************************************************************************
  // getaccount
  // Returns player details such as unique ID, currency and language
  //
  // 1. Validates Input inc temp token
  // 2. Gets any session Details
  // 3. Queries Texas for account information
  // 4. Generates a permanent UNIQUE token
  // 5. Updates the Session table
  // 6. Writes an audit log
  // 7. Returns an Account Response object
  // ************************************************************************************************************
  getaccount()
    {
      return new Promise ( resolve =>
      {
        //validate request

        //Get Session Details

        //Get Customer Details from Texas using IDMMCustomer VIA API Gateway
        var accountID = "PF3140629"
        var currency ="GBP"
        var country = "GB"
        var jurisdiction = "UK"
        var nationalid =""
        var nickname = ""

        //If Temp Token Generate new one.

        var token = Token.CreateTokenId();

        //create base Account response
        resolve( new AccountResponse( this.event.request, 0, "", this.event.apiversion, token, accountID, currency, country, jurisdiction, nationalid, nickname ));

        //Update Token

      });
    }

  // ************************************************************************************************************
  // getbalance
  // Returns balance for specified player
  //
  // 1. Validates Input inc temp token & gamesessionid
  // 2. Gets any session Details
  // 3. Queries Texas for account information
  // 4. Queries Texas for account balance
  // 6. Writes an audit log
  // 7. Returns an Balance Response object
  // ************************************************************************************************************
  getbalance()
  {
    //validate request

    //get session Details

    //Call Get Account

    return new Promise ( resolve =>
    {
      //validate request

      //Get Session Details

      //Get Customer Details from Texas using IDMMCustomer VIA API Gateway
      var currency ="GBP";
      var bonusbalance = 0;
      var realbalance = 15.99;

      //create base Account response constructor( request, resultcode, message, apiversion, currency, bonusbalance, realbalance )
      resolve( new BalanceResponse( this.event.request, 0, "", this.event.apiversion, currency, bonusbalance, realbalance ));

      //Update Token

    });
  }

  result()
  {
    //validate request

    //get session Details

    //Call Get Account

    return new Promise ( resolve =>
    {
      //validate request

      //Get Session Details

      //Get Customer Details from Texas using IDMMCustomer VIA API Gateway
      var realmoneybet = this.event.betamount
      var bonusmoneybet = 0
      var bonusbalance = 0
      var realbalance = 15.99 + this.event.wonamount
      var currency = "GBP"
      console.log(this.event);


      //constructor( sessiontoken, transactionid, transactiontype, betamount, state, wonamount )
      var transaction = new Transaction( this.event.sessionid, this.event.transactionid, "wager", this.event.betamount, "pending", this.event.wonamount)

      //    constructor (request, resultcode, message, apiversion, currency, bonusbalance, realbalance, totalamount )
      var response = new ResultResponse ( this.event.request, 0, "", this.event.apiversion, currency, bonusbalance, realbalance, this.event.betamount )

    });
  }

  wager()
  {
    //validate request

    //get session Details

    //Call Get Account

    return new Promise ( resolve =>
    {
      //validate request

      //Get Session Details

      //Get Customer Details from Texas using IDMMCustomer VIA API Gateway
      var realmoneybet = this.event.betamount
      var bonusmoneybet = 0
      var bonusbalance = 0
      var realbalance = 15.99 - this.event.betamount
      var currency = "GBP"
      console.log(this.event);
      //constructor( sessiontoken, transactionid, transactiontype, betamount, state, wonamount )
      var transaction = new Transaction( this.event.sessionid, this.event.transactionid, "wager", this.event.betamount, "placed", 0)

      console.log(transaction);

      var TransactionTable =
      {
          TableName:"GamingTransaction",
          Item: transaction,
          ConditionExpression: "attribute_not_exists(GamingTransactionID)" //prevent overwriting
      };

      db.put(TransactionTable, function(err, returndata)
      {
        if (err)
        {
          console.log( `Audit operation result : ${err}`);
          if(err.code.includes("ConditionalCheckFailedException"))
            //we will just send the same response as before.
            resolve( new WagerResponse( this.event.request, 0, "", this.event.apiversion, currency, bonusbalance, realbalance, realmoneybet, bonusmoneybet, "placed" ));
          else
            resolve( new WagerResponse( this.event.request, 1, "Server Error", this.event.apiversion, null, null, null, null, null, null ));
        }
        else
        {
          console.log( `Audit operation result : ${returndata}`);
          resolve( new WagerResponse( this.event.request, 0, "", this.event.apiversion, currency, bonusbalance, realbalance, realmoneybet, bonusmoneybet, "placed" ));
        }
      }.bind(this));


    });
  }



  ping()
  {
    return new Promise ( resolve =>
    {

      //create base Account response constructor( request, resultcode, message, apiversion, currency, bonusbalance, realbalance )
      resolve( new BalanceResponse( this.event.request, 0, "", this.event.apiversion ));

    });
  }

  validate()
  {
    //validate abstract request details

    return true
  }
}

class Transaction
{
  constructor( sessiontoken, transactionid, transactiontype, betamount, state, wonamount )
  {
    this.GamingTransactionID = `${sessiontoken}~${transactionid}~${transactiontype}`;
    this.SessionToken = sessiontoken;
    this.TransactionId = transactionid;
    this.transactiontype = transactiontype;
    this.betamount = betamount;
    this.state = state;
    this.wonamount = wonamount
  }
}

class AccountResponse
{
  constructor( request, resultcode, message, apiversion, gamesessionid, accountid, currency, country, jurisdiction, nationalid, nickname )
  {
    this.request = request,
    this.resultcode = resultcode,
    this.message = message,
    this.apiversion = apiversion,
    this.gamesessionid = gamesessionid,
    this.accountid = accountid,
    this.currency = currency,
    this.country = country,
    this.jurisdiction = jurisdiction,
    this.nationalid = nationalid,
    this.nickname = nickname
  }
}

class BalanceResponse
{
  constructor( request, resultcode, message, apiversion, currency, bonusbalance, realbalance )
  {
    this.request = request,
    this.resultcode = resultcode,
    this.message = message,
    this.apiversion = apiversion,
    this.currency = currency,
    this.bonusbalance = bonusbalance,
    this.realbalance = realbalance
  }
}


class WagerResponse
{
  constructor (request, resultcode, message, apiversion, currency, bonusbalance, realbalance, realmoneybet, bonusmoneybet )
  {
    this.request = request,
    this.resultcode = resultcode,
    this.message = message,
    this.apiversion = apiversion,
    this.currency = currency,
    this.bonusbalance = bonusbalance,
    this.realbalance = realbalance,
    this.realmoneybet = realmoneybet,
    this.bonusmoneybet = bonusmoneybet
  }
}


class ResultResponse
{
  constructor (request, resultcode, message, apiversion, currency, bonusbalance, realbalance, totalamount )
  {
    this.request = request,
    this.resultcode = resultcode,
    this.message = message,
    this.apiversion = apiversion,
    this.currency = currency,
    this.bonusbalance = bonusbalance,
    this.realbalance = realbalance,
    this.totalamount = totalamount

  }
}
