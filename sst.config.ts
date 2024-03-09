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
      const pool = new UserPool(stack, "userPool");
      const client = pool.addClient("client", {
        oAuth: {
          flows: {
            implicitCodeGrant: true,
          },
          callbackUrls: ["http://localhost:300"],
        },
      });
      const domain = pool.addDomain("birddave", {
        cognitoDomain: {
          domainPrefix: "birddave",
        },
      });

      const signInUrl = domain.signInUrl(client, {
        redirectUri: "http://localhost:300", // must be a URL configured under 'callbackUrls' with the client
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
          BUCKET_NAME: bucket.bucketName,
          BUCKET_REGION: REGION,
        },
      });

      stack.addOutputs({
        StackName: stack.stackName,
        SiteUrl: site.url,
        BucketName: bucket.bucketName,
        Region: REGION,
      });
    });

    app.setDefaultRemovalPolicy("destroy");
  },
} satisfies SSTConfig;
