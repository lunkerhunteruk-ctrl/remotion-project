/**
 * Deploy Remotion Lambda function and site bundle to AWS.
 *
 * Usage:
 *   npx tsx scripts/deploy-lambda.ts
 *
 * Environment variables required:
 *   REMOTION_AWS_ACCESS_KEY_ID
 *   REMOTION_AWS_SECRET_ACCESS_KEY
 *
 * This script:
 * 1. Deploys the Lambda function (if not already deployed)
 * 2. Bundles and uploads the Remotion project to S3
 * 3. Outputs the function name and serve URL for use in rendering
 */

import { deploySite, getOrCreateBucket, deployFunction, getFunctions } from "@remotion/lambda";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const REGION = "us-east-1";
const SITE_NAME = "vual-dynamic";
const MEMORY_SIZE = 3008;
const TIMEOUT = 240;

async function main() {
  console.log("🎬 Deploying Remotion Lambda...\n");

  // 1. Check for existing function or deploy new one
  console.log("1. Checking Lambda functions...");
  const existingFunctions = await getFunctions({
    region: REGION,
    compatibleOnly: true,
  });

  let functionName: string;
  const targetMemory = `mem${MEMORY_SIZE}mb`;
  const matchingFunction = existingFunctions.find(f => f.functionName.includes(targetMemory));

  if (matchingFunction) {
    functionName = matchingFunction.functionName;
    console.log(`   ✓ Using existing function: ${functionName}`);
  } else {
    console.log(`   Deploying new Lambda function (${MEMORY_SIZE}MB)...`);
    const { functionName: newFn } = await deployFunction({
      region: REGION,
      timeoutInSeconds: TIMEOUT,
      memorySizeInMb: MEMORY_SIZE,
      createCloudWatchLogGroup: true,
    });
    functionName = newFn;
    console.log(`   ✓ Deployed function: ${functionName}`);
  }

  // 2. Deploy site (bundle + upload to S3)
  console.log("\n2. Bundling and uploading site...");
  const { bucketName } = await getOrCreateBucket({ region: REGION });
  console.log(`   Bucket: ${bucketName}`);

  const { serveUrl } = await deploySite({
    region: REGION,
    bucketName,
    entryPoint: path.resolve(__dirname, "../src/index.ts"),
    siteName: SITE_NAME,
  });
  console.log(`   ✓ Site deployed: ${serveUrl}`);

  // 3. Output summary
  console.log("\n═══════════════════════════════════════");
  console.log("  Deployment Complete!");
  console.log("═══════════════════════════════════════");
  console.log(`  Region:        ${REGION}`);
  console.log(`  Function:      ${functionName}`);
  console.log(`  Serve URL:     ${serveUrl}`);
  console.log(`  Site Name:     ${SITE_NAME}`);
  console.log("═══════════════════════════════════════");
  console.log("\nAdd these to your Vercel environment variables:");
  console.log(`  REMOTION_AWS_REGION=${REGION}`);
  console.log(`  REMOTION_FUNCTION_NAME=${functionName}`);
  console.log(`  REMOTION_SERVE_URL=${serveUrl}`);
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
