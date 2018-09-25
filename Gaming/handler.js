'use strict';

var AWS = require('aws-sdk');

const uuidV4 = require('uuid/v4');

var db = new AWS.DynamoDB.DocumentClient();

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports.handler = async (event, context) => {

  var now = new Date();
  var createdDate = now;
  var expiryDate = new Date();
  expiryDate = addDays(expiryDate, 1);

  var body = JSON.parse( event.body );

  //(clientIPAddress, extensionData, iddcLanguage, idmmBusinessUnit, sessionToken)
  var texascontext = new TexasContext( body.User.Context.ClientIPAddress, null, body.User.Context.IDDCLanguage, body.User.Context.IDMMBusinessUnit, body.User.Context.SessionToken );

  //(texascontext, IDMMCustomer, IDDCApplication, IDCCLanguage, requireAccountDetails)
  //need to understand what IDDCApplication is.....
  let texas = Texas.getcustomerdetails( texascontext, body.User.Customer.IDMMCustomer, "Gaming", body.User.Context.IDDCLanguage, true );

  let session = new Session( uuidV4(),
      createdDate.toJSON(),
      expiryDate.toJSON(),
      "temporary", //will always be temp for those that do not renew the token we will just change the state later.
      texas.tenant,
      texas.subtenant,
      texas.platform,
      body.User.Customer.IDMMCustomer,
      body.User.userAgent,
      false,
      "local",
      body.User.Context.ClientIPAddress,
      body.User.Context.IDDCLanguage,
      body.User.Context.IDMMBusinessUnit,
      body.User.Context.SessionToken,
      "Credit",
      texas.accountid,
      texas.currency,
      body.ParamQS,
      body.GameID,
      null,
      body.Provider,
      null,
      null
    );

    console.log(JSON.stringify(session));

    await session.insert( session );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Gaming handler executed successfully',
      input: session.getresponse(),
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

class TexasContext
{
  contructor(clientIPAddress, extensionData, iddcLanguage, idmmBusinessUnit, sessionToken)
  {
    this.clientIPAddress = clientIPAddress;
    this.extensionData = extensionData;
    this.iddcLanguage - iddcLanguage;
    this.idmmBusinessUnit = idmmBusinessUnit;
    this.sessionToken = sessionToken;
  }
}

class Texas
{
  static getcustomerdetails(texascontext, IDMMCustomer, IDDCApplication, IDCCLanguage, requireAccountDetails)
  {
      //Proxy the below call via the new API Gateway
      //call CustomerService.CustomerDetails GetCustomerDetails(ConsoleApp1.CustomerService.TexasContext texasContext, string IDDCLanguage, decimal IDMMCustomer, string IDDCApplication, bool returnAccountDetails, string[] preferenceNames);

      //In reality this would be from Texas. We do not want to hold any PII we should
      return {
        //Lookup not from texas
        tenant: "betfred",
        subtenant: "betfred",
        platform: "desktop",
        //from texas
        currency: "GBP",
        //please note I am unsure if the accountno in reality is the customerid witht he business unit tagged on (PF = petfre or TS = totesport). N.b. Tote does not currently support Nyx Betfred only at this stage but should be extensible
        accountid: `PF${IDMMCustomer}`
      }

  }
}

class response
{
  constructor( url, rcaccountID, statuscode, timestamp )
  {
    this.LaunchUrl = url;
    this.RCAccountId = rcaccountID;
    this.statusCode = statuscode;
    this.TimeStamp = timestamp;
  }
}

class Session
{
  constructor (SessionID, createdDate, expiryDate, tokenType, Tenant, SubTenant, Platform, Customer, UserAgent, IsUserAnonymous, Environment, ClientIPAddress, Language, BusinessUnit, texasToken ,
  AccountClass, Username, CurrencyCode,LaunchParams, gameId, game, ProviderName, providertypeID, ProviderSessionID)
  {
      this.SessionToken = SessionID;
      this.createdDate = createdDate;
      this.expiryDate = expiryDate;
      this.tokenType = tokenType;
      //***********************************************
      //Source
      //***********************************************
      this.Tenant = Tenant;
      this.SubTenant = SubTenant;
      this.Platform = Platform;
      this.Customer = Customer;
      this.UserAgent = UserAgent;
      this.IsUserAnonymous = IsUserAnonymous;
      this.Environment = Environment;
      //***********************************************
      this.BusinessUnitID = BusinessUnit;
      this.Customer = Customer;
      //***********************************************
      //Account Details
      //***********************************************
      this.ClientIPAddress=ClientIPAddress;
      this.IDDCLanguage= Language;
      this.texasToken = texasToken;
      this.IDMMAccountClass = AccountClass;
      //***********************************************
      this.Username = Username;
      this.CurrencyCode = CurrencyCode;
      this.LaunchParams = LaunchParams;
      this.gameId = gameId;
      this.game = game;
      this.ProviderName = ProviderName;
      this.providertypeID = providertypeID;
      this.ProviderSessionID = ProviderSessionID;

      this.depositurl = "http%3a%2f%2fta4.betfred.com%2faccount";
      this.lobbyurl = "https%3a%2f%2fcustmessage.betfred.com%2fgameclosed";
      this.realitycheckuklimit = 0;
      this.realitycheckukelapsed = 0;
      this.realitycheckukproceeed = "https%3a%2f%2fstg-push.betfred.com%2fcompliance%2frcAction%2f%3fAID%3d%26userAction%3d1&";
      this.realitycheckukexit = "https%3a%2f%2fstg-push.betfred.com%2fcompliance%2frcAction%2f%3fAID%3d%26userAction%3d2&";
      this.realitycheckukhistory = "https%3a%2f%2fta4.betfred.com%2faccount%2fstatement&jurisdiction=uk";
  }

  getresponse()
  {
    var url = `https://ogs-gl-stage.nyxgib.eu/game/?nogsgameid=${this.gameId}&nogsoperatorid=982&sessionid=${this.SessionToken}&nogscurrency=${this.CurrencyCode}&\
nogslang=${this.IDDCLanguage}&nogsmode=real&accountid=${this.Customer}&device=desktop&\
depositurl${this.depositurl}=&lobbyurl${this.lobbyurl}=&realitycheck_uk_limit=${this.realitycheckuklimit}&realitycheck_uk_elapsed=${this.realitycheckukelapsed}&\
realitycheck_uk_proceed=${this.realitycheckukproceeed}\
realitycheck_uk_exit=${this.realitycheckukexit}\
realitycheck_uk_history=${this.realitycheckukhistory}`

    return new response( url, "0", "0", Date.Now );
  }

  insert(item)
  {
    return new Promise (function (resolve, reject )
    {
      var gamingSessionTable =
      {
          TableName:"GamingSession",
          Item: item
      };

      db.put(gamingSessionTable, function(err, returndata)
      {
        if (err)
        {
            reject(err);
        }
        else
        {
          console.log( `gamingsessionput operation result : ${returndata}`);
          resolve(item.SessionToken);
        }
      });
    });
  }
}
