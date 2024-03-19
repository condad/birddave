import { SSTConfig } from "sst";
import { Cognito, Bucket, NextjsSite, Table } from "sst/constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";

const REGION = "ca-central-1";

export default {
  config(_input) {
    return {
      name: "birddave",
      region: "ca-central-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const pool = new UserPool(stack, "userPool", {
        selfSignUpEnabled: true,
        signInAliases: {
          email: true,
        },
        autoVerify: { email: true },
      });
      const client = pool.addClient("client", {
        oAuth: {
          flows: {
            implicitCodeGrant: true,
          },
          callbackUrls: ["http://localhost:3000", "http://localhost:3000/upload"],
        },
      });
      const domain = pool.addDomain("birddave", {
        cognitoDomain: {
          domainPrefix: "birddave",
        },
      });

      const signInUrl = domain.signInUrl(client, {
        redirectUri: "http://localhost:3000/upload", // must be a URL configured under 'callbackUrls' with the client
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
            blockPublicAccess: {
              blockPublicAcls: false,
              blockPublicPolicy: false,
              ignorePublicAcls: false,
              restrictPublicBuckets: false,
            },
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

      const site = new NextjsSite(stack, "site", {
        path: ".",
        bind: [bucket, table],
        environment: {
          COGNITO_SIGN_IN_URL: signInUrl,
          COGNITO_USER_POOL_ID: pool.userPoolId,
        },
      });

      stack.addOutputs({
        StackName: stack.stackName,
        SiteUrl: site.url,
        UserPoolId: pool.userPoolId,
        ClientId: client.userPoolClientId,
        CognitoSignInUrl: signInUrl,
        BucketName: bucket.bucketName,
        Region: REGION,
      });
    });

    app.setDefaultRemovalPolicy("destroy");
  },
} satisfies SSTConfig;
