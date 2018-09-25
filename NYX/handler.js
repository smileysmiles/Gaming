'use strict';

var Token = require('../Token.js')

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
        response = this.event;
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
  }

  validate()
  {
    //validate abstract request details

    return true
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
