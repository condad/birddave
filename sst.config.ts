import { SSTConfig } from "sst";
import { Cognito, Bucket, NextjsSite, Table } from "sst/constructs";

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
      const auth = new Cognito(stack, "auth", {
        login: ["email"],
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
