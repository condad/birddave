import { SSTConfig } from "sst";
import { Cognito, Bucket, NextjsSite, Table, use } from "sst/constructs";
import { UserPool, UserPoolIdentityProviderGoogle, ProviderAttribute } from "aws-cdk-lib/aws-cognito";
import { ObjectOwnership } from "aws-cdk-lib/aws-s3";

const REGION = "us-east-1";
const DOMAIN = "birddave.com";

export function Infra({ stack }) {
  var baseURL = "http://localhost:3000";
  var cognitoDomain = "birddave-dev";

  if (stack.stage === "prod") {
    baseURL = `https://${DOMAIN}`;
    cognitoDomain = "birddave";
  }

  const pool = new UserPool(stack, "userPool", {
    selfSignUpEnabled: true,
    signInAliases: {
      email: true,
    },
    userPoolName: `birddave-${stack.stage}`,
    autoVerify: { email: true },
  });

  const googleProvider = new UserPoolIdentityProviderGoogle(stack, "Google", {
    userPool: pool,
    clientId: "540371764473-v84uogpq7ivs8a50ls4ofmqpa3egk9q6.apps.googleusercontent.com",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ["openid", "email", "profile"],
    attributeMapping: {
      email: ProviderAttribute.GOOGLE_EMAIL,
    },
  });

  pool.registerIdentityProvider(googleProvider);

  const client = pool.addClient("client", {
    oAuth: {
      flows: {
        implicitCodeGrant: true,
      },
      callbackUrls: [baseURL, `${baseURL}/tokens`],
    },
  });

  const domain = pool.addDomain("birddave", {
    cognitoDomain: {
      domainPrefix: cognitoDomain,
    },
  });

  const signInUrl = domain.signInUrl(client, {
    redirectUri: `${baseURL}/tokens`, // must be a URL configured under 'callbackUrls' with the client
  });

  const auth = new Cognito(stack, "auth", {
    cdk: {
      userPool: pool,
      userPoolClient: client,
    },
  });

  const bucket = new Bucket(stack, "public", {
    cdk: {
      bucket: {
        objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        publicReadAccess: true,
      },
    },
  });

  const table = new Table(stack, "table", {
    fields: {
      id: "string",
      species: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  stack.addOutputs({
    StackName: stack.stackName,
    UserPoolId: pool.userPoolId,
    ClientId: client.userPoolClientId,
    CognitoSignInUrl: signInUrl,
    BucketName: bucket.bucketName,
    Region: REGION,
  });

  return {
    table,
    bucket,
    cognitoClient: client,
    cognitoPool: pool,
    signInUrl,
  };
}

export function Site({ stack }) {
  const { table, bucket, cognitoClient, cognitoPool, signInUrl } = use(Infra);

  const site = new NextjsSite(stack, "site", {
    path: ".",
    customDomain: DOMAIN,
    bind: [bucket, table],
    environment: {
      NEXT_PUBLIC_SIGN_IN_URL: signInUrl,
      NEXT_PUBLIC_EBIRD_KEY: "jfekjedvescr",
      COGNITO_USER_POOL_ID: cognitoPool.userPoolId,
      COGNITO_CLIENT_ID: cognitoClient.userPoolClientId,
    },
    permissions: ["cognito-idp:AdminGetUser"],
  });

  stack.addOutputs({
    SiteId: site.id,
    SiteUrl: site.url,
  });

  return { site };
}

export default {
  config(_input) {
    return {
      name: "birddave",
      region: REGION,
      profile: "conhub",
    };
  },
  stacks(app) {
    app.stack(Infra);
    app.stack(Site);

    app.setDefaultRemovalPolicy("destroy");
  },
} satisfies SSTConfig;
