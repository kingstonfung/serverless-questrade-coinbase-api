# AWS Serverless <> Questrade API (WIP)

## Fun serverless weekend project that connects with Questrade API:
- Handles Questrade's oAuth process
- Fetches account info
- Return authenticated WebSocket info (or renders an ugly html page that'll update ticker prices)

## This project spins off 3 endpoints:
- `/exchange-token`: Exchanges auth code from Questrade oAuth Client for access token & refresh token, then store those info in S3 (yes I said S3, please see FAQ below)
  - `?code=XXXXXX` : Authorization code from Questrade
  - `&email=brrrr@wallstreetbets.r` : Email address of the user authenticating
  - Returns a MD5 hash string (eg: `0F908424DCEBC49548EC2977F501FE83`), this key is to access to other features below...
  - You will need to provide this endpoint to Questrade as the callback URL
- `/retrieve-accounts-info`: Pulls all the user's account info. Requires you to pass in the hashed user email to the `get` url
  - `?hash=0F908424DCEBC49548EC2977F501FE83` : Required to know which user info to use
  - `&simpleResponse=true` : Optional, will simplify the output to $CAD balance only (great for spreadsheets)
  - Returns the account details from the authenticated user
- `/get-websocket-info`: Returns all the necessary info to the client that would initiate a WebSocket connection, by supplying ticker symbols. Requires you to pass in the hashed email in the `get` url
  - `?hash=0F908424DCEBC49548EC2977F501FE83` : Required to know which user info to use
  - `&symbols=AAPL,MSFT` : Comma-separated list of ticker symbols to subscribe for WebSocket
  - If `POST`: returns JSON data containing info to setup WebSocket
  - If `GET` : returns an ugly html with WS connection established. Page refreshes every 30 minutes as per Questrade's documentation

## Prerequisites
- You'll need a Questrade account
- Some basic knowledge of [Serverless, lambda with NodeJS](https://www.serverless.com/framework/docs/providers/aws/guide/quick-start/)
- Understanding of [Questrade's API](https://www.questrade.com/api/documentation/getting-started)
- You have [an AWS Account](https://aws.amazon.com/)
- [Create a S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html) (And then note down the name)
- Run `yarn` or `npm install`
- [Install](https://www.npmjs.com/package/serverless) `serverless` on your system

## Quick Start Guide:
1. Create a `config.yml` file at the project root directory with your own values as shown below
1. Do a `serverless deploy` and **take note of the endpoints URLs**
1. Go back to `config.yml` and enter the url (from above) ending `/exchange-token` as the value for `redirectURI` (this step is to be improved)
1. Sign in to your Questrade account, click on "App hub" and register your own person app
1. Enter the url again as a "Call back URL", the one ending `/exchange-token`
1. Go to the Questrade oAuth URL with the `redirect_uri` as your exchange-token endpoint, such as: `https://login.questrade.com/oauth2/authorize?client_id={{ "Consumer key" from Questrade }}&response_type=code&redirect_uri={{ exchange-token endpoint }}?email={{ any email }}`
1. After authenticating, Questrade will redirect you to the token exchange endpoint. If successful, you should see a hash number. This is the key to access your other endpoints.
1. Go to the endpoint ending `/retrieve-accounts-info` with your hash to access your account info
1. Go to the endpoint ending `/get-websocket-info` with your hash and ticker symbols to see real-time market data using WebSocket

## Removing The Stack:
1. Run `serverless remove`
1. Delete the S3 bucket that you created
1. Delete the application registered at Questrade

## Creating the `config.yml` file to get started. For example:
```yml
private:
  region: us-west-2
  bucketName: your-s3-bucket-name
  authDataFileName: json-for-storing-creds.json
  getUrlPubKey: some-random-hash-to-prevent-guessing
  redirectURI: the-url-of-your-services
  qtDomain: https://login.questrade.com/oauth2/token
  qtClientId: your-questrade-public-client-key
settings:
  region: us-west-2
  genericErrorMessage: Random error msg to scare off the crows
  md5ScrambleMultiplier: any int so people can't easily guess MD5'ed emails
```

## Early prototype warnings:
**Not suitable for commercial use, or risk averse users. For educational purpose only.**

Once an user authenticates with your app through Quesetrade, the only security measure is their MD5 hashed email address, exposed as a `get` url query parameter. So if someone can guess your endpoints URL and the hash, they can potentially read account balances of a specific user.

Questrade does not allow trade exections done via API unless the app/developer goes through a compliance application process. Although all information handled in this project is not personally-identifiable, but please use caution as you toy around this project.

Bottom line: Just be careful and don't toss around URLs in the open... or else people could find out how much money you've got in your accounts.

## FAQ:
**Q**: How do I.....

**A**: This is a very early (WIP) project, requiring fundamental knowledge of Questrade's API ecosystem. Read more here first: https://www.questrade.com/api/documentation/getting-started

**Q**: S3 to store credentials !?

**A**: It's _good enough_, just watch what you're doing as you setup the S3 bucket. Of course Secrets Manager is better, but they're too costly for a fun project.

**Q**: Hashed Emails as S3 "folders" and urls !?

**A**: It's MD5 hashed `{x}` number of times (privately set in `config.yml`), makes it a lot harder to guess by average users. Of course Cognito User Pools is better, perhaps that can be a future iteration...

**Q**: Too many secrets in a common yml file!

**A**: Most of these are public keys and non-sensitive info. Also gitignored so other coders shouldn't be able to pry open your storage...

## More development to come... happy printing! 💎 🙌
#### (Disclaimer: Neither myself or this project was sponsored by Questrade!)
