import { createHash, createHmac } from "node:crypto";

const [mode, endpointValue, region, bucket, foreignBucket, name, owner] =
  process.argv.slice(2);

if (
  !["health", "isolation"].includes(mode) ||
  !endpointValue ||
  !region ||
  !bucket ||
  !foreignBucket ||
  !name ||
  !owner
) {
  throw new Error("Garage check contract arguments are required.");
}

const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
  throw new Error("Garage credentials are required.");
}

const endpoint = new URL(endpointValue);
const service = "s3";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return createHmac("sha256", key).update(value).digest(encoding);
}

async function signedRequest(targetBucket, method, query = "") {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = `/${encodeURIComponent(targetBucket)}`;
  const canonicalQuery = query;
  const payloadHash = sha256("");
  const canonicalHeaders =
    `host:${endpoint.host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const url = new URL(canonicalUri, endpoint);
  url.search = canonicalQuery;

  return fetch(url, {
    method,
    headers: {
      Authorization: authorization,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    redirect: "error",
    signal: AbortSignal.timeout(5_000),
  });
}

const ownResponse = await signedRequest(bucket, "HEAD");
if (!ownResponse.ok) {
  throw new Error("Garage denied the declared Work Items bucket.");
}

if (mode === "health") {
  process.stdout.write(
    `${JSON.stringify({
      bucket,
      health: "healthy",
      name,
      owner,
      profile: "garage",
    })}\n`,
  );
} else {
  const foreignResponse = await signedRequest(
    foreignBucket,
    "GET",
    "list-type=2&max-keys=1",
  );
  if (foreignResponse.status !== 403) {
    throw new Error("Garage foreign-bucket check did not return HTTP 403.");
  }
  process.stdout.write(
    `${JSON.stringify({
      bucket,
      foreign_bucket: foreignBucket,
      foreign_bucket_access: false,
      name,
      own_bucket_access: true,
      profile: "garage",
    })}\n`,
  );
}
