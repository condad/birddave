import { SSTConfig } from "sst";
import { Bucket, NextjsSite } from "sst/constructs";

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
      const bucket = new Bucket(stack, "public");
      const site = new NextjsSite(stack, "site", {
        path: ".",
        bind: [bucket],
        environment: {
          BUCKET_NAME: bucket.bucketName,
          BUCKET_REGION: REGION,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
        BucketName: bucket.bucketName,
        Region: REGION,
      });
    });

    app.setDefaultRemovalPolicy("destroy");
  },
} satisfies SSTConfig;
