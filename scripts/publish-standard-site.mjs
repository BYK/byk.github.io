#!/usr/bin/env node
/**
 * Publish byk.im's standard.site records (https://standard.site) to the
 * `@byk.im` Bluesky PDS over AT Protocol.
 *
 * Records are read from the build manifest (dist/standard-site.json), so build
 * the site first:
 *
 *   pnpm build
 *   BSKY_APP_PASSWORD='xxxx-xxxx-xxxx-xxxx' pnpm publish:standard-site
 *
 * Auth uses a Bluesky app password (create one at
 * https://bsky.app/settings/app-passwords). It is read from BSKY_APP_PASSWORD
 * and never logged. BSKY_HANDLE defaults to "byk.im".
 *
 * Idempotent: records use deterministic rkeys (publication "self", documents =
 * post slug) written with putRecord, so re-running updates them in place rather
 * than creating duplicates. After upserting the current set, it prunes document
 * records that no longer have a matching post (deleted posts or renamed slugs)
 * so the PDS stays in sync with the published blog.
 */

import { readFile } from "node:fs/promises";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";

const HANDLE = process.env.BSKY_HANDLE ?? "byk.im";
const PASSWORD = process.env.BSKY_APP_PASSWORD;
const MANIFEST_URL = new URL("../dist/standard-site.json", import.meta.url);
const WELL_KNOWN_URL = new URL(
  "../public/.well-known/site.standard.publication",
  import.meta.url,
);
const DIST_URL = new URL("../dist/", import.meta.url);

// Hard ceiling for image blobs (icon / coverImage). The lexicons declare
// maxSize: 1000000 for both site.standard.publication#icon and
// site.standard.document#coverImage; mirror it here (kept in sync with
// MAX_BLOB_BYTES in src/lib/standard-site.ts). Anything larger is skipped, not
// uploaded, so an oversized asset degrades to a record without a cover rather
// than failing the write.
const MAX_BLOB_BYTES = 1_000_000;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function xrpcGet(baseUrl, nsid, query) {
  const url = new URL(`/xrpc/${nsid}`, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url);
  if (!res.ok) fail(`${nsid} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

async function xrpcPost(baseUrl, nsid, body, token) {
  const res = await fetch(new URL(`/xrpc/${nsid}`, baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) fail(`${nsid} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Upload raw image bytes as an AT Protocol blob and return the resulting blob
 * ref (the `{$type:"blob", ref, mimeType, size}` object embedded into records).
 */
async function uploadBlob(pds, bytes, mimeType, token) {
  const res = await fetch(new URL("/xrpc/com.atproto.repo.uploadBlob", pds), {
    method: "POST",
    headers: { "content-type": mimeType, authorization: `Bearer ${token}` },
    body: bytes,
  });
  if (!res.ok)
    fail(`com.atproto.repo.uploadBlob -> ${res.status}: ${await res.text()}`);
  return (await res.json()).blob;
}

/**
 * Read a manifest blob source from the build output and upload it, returning the
 * blob ref. Best-effort: a missing or oversized file logs a warning and returns
 * null so the record is still published — just without the image — rather than
 * failing the whole run. (The bytes ship to AT Protocol exactly as built; the
 * size cap mirrors the lexicon's 1 MB maxSize.)
 */
async function resolveBlob(source, token, pds) {
  let bytes;
  try {
    bytes = await readFile(new URL(source.path, DIST_URL));
  } catch {
    console.warn(
      `⚠ blob ${source.path} not found in dist/ — publishing record without it`,
    );
    return null;
  }
  if (bytes.length > MAX_BLOB_BYTES) {
    console.warn(
      `⚠ blob ${source.path} is ${bytes.length} bytes (> ${MAX_BLOB_BYTES} cap) — publishing record without it`,
    );
    return null;
  }
  return uploadBlob(pds, bytes, source.mimeType, token);
}

async function resolvePds(did) {
  const res = await fetch(`https://plc.directory/${did}`);
  if (!res.ok) fail(`could not resolve DID document for ${did}: ${res.status}`);
  const doc = await res.json();
  const pds = (doc.service ?? []).find(
    (s) => s.type === "AtprotoPersonalDataServer",
  )?.serviceEndpoint;
  if (!pds) fail(`no PDS endpoint in DID document for ${did}`);
  return pds;
}

async function listAllRecords(pds, repo, collection) {
  const records = [];
  let cursor;
  do {
    const query = { repo, collection, limit: "100" };
    if (cursor) query.cursor = cursor;
    const page = await xrpcGet(pds, "com.atproto.repo.listRecords", query);
    const batch = page.records ?? [];
    records.push(...batch);
    // Stop when a page returns nothing, even if the PDS still hands back a
    // cursor, so an always-present cursor can never spin forever.
    cursor = batch.length > 0 ? page.cursor : undefined;
  } while (cursor);
  return records;
}

/**
 * Pure diff: given the document records currently in the repo and the set of
 * rkeys the build wants to keep, return the rkeys that should be deleted.
 * Exported for unit testing.
 */
export function computeOrphanRkeys(existingRecords, keepRkeys) {
  const keep = keepRkeys instanceof Set ? keepRkeys : new Set(keepRkeys);
  const orphans = [];
  for (const rec of existingRecords) {
    const rkey = rec.uri.split("/").pop();
    if (rkey && !keep.has(rkey)) orphans.push(rkey);
  }
  return orphans;
}

async function readManifest() {
  let raw;
  try {
    raw = await readFile(MANIFEST_URL, "utf8");
  } catch {
    fail("dist/standard-site.json not found — run `pnpm build` first");
  }
  const manifest = JSON.parse(raw);

  // Guard against drift between the static verification file and the records.
  const wellKnown = (await readFile(WELL_KNOWN_URL, "utf8")).trim();
  if (wellKnown !== manifest.publication.uri) {
    fail(
      `.well-known/site.standard.publication (${wellKnown}) does not match the ` +
        `publication record AT-URI (${manifest.publication.uri})`,
    );
  }
  return manifest;
}

async function main() {
  if (!PASSWORD) {
    fail(
      "BSKY_APP_PASSWORD is required (create an app password at https://bsky.app/settings/app-passwords)",
    );
  }

  const manifest = await readManifest();

  // Resolve identity -> PDS, then open an app-password session.
  const { did } = await xrpcGet(
    "https://public.api.bsky.app",
    "com.atproto.identity.resolveHandle",
    { handle: HANDLE },
  );
  const pds = await resolvePds(did);
  const session = await xrpcPost(pds, "com.atproto.server.createSession", {
    identifier: HANDLE,
    password: PASSWORD,
  });
  console.log(`✓ authenticated as ${HANDLE} (${session.did}) on ${pds}`);

  // The records embed a hardcoded DID (their AT-URIs). If BSKY_HANDLE was
  // overridden to a different account, we would otherwise write the blog's
  // records into the wrong repo. Refuse unless the authenticated identity owns
  // the DID the records are addressed to.
  const recordDid = manifest.publication.uri.split("/")[2];
  if (session.did !== recordDid) {
    fail(
      `authenticated DID (${session.did}) does not match the DID in the ` +
        `records (${recordDid}); refusing to publish to the wrong repo`,
    );
  }

  const records = [
    {
      collection: manifest.publication.record.$type,
      rkey: manifest.publication.rkey,
      record: manifest.publication.record,
      uri: manifest.publication.uri,
      // Publication icon: blob field is `icon`.
      blobField: "icon",
      blobSource: manifest.publication.icon,
    },
    ...manifest.documents.map((doc) => ({
      collection: doc.record.$type,
      rkey: doc.rkey,
      record: doc.record,
      uri: doc.uri,
      // Document cover image: blob field is `coverImage`.
      blobField: "coverImage",
      blobSource: doc.coverImage,
    })),
  ];

  for (const {
    collection,
    rkey,
    record,
    uri,
    blobField,
    blobSource,
  } of records) {
    // Upload the image blob (if any) and attach its ref before writing the
    // record, so the record and its blob land in a single putRecord. Blobs are
    // content-addressed, so unchanged bytes yield the same ref and the upsert
    // stays a no-op on re-runs; resolveBlob returns null (record published
    // without the image) on a missing/oversized file rather than failing.
    if (blobSource) {
      const blob = await resolveBlob(blobSource, session.accessJwt, pds);
      if (blob) record[blobField] = blob;
    }
    // validate:false — the PDS does not host the site.standard.* lexicons, so
    // schema validation would reject otherwise-valid records.
    await xrpcPost(
      pds,
      "com.atproto.repo.putRecord",
      { repo: session.did, collection, rkey, record, validate: false },
      session.accessJwt,
    );
    console.log(`✓ put ${uri}${record[blobField] ? " (+image)" : ""}`);
  }

  // Prune document records with no matching post. Runs only after every current
  // record has been upserted above, so a failure mid-run never strands the blog
  // without its live records.
  let deleted = 0;
  if (manifest.documents.length === 0) {
    // A broken or empty build must never be able to wipe the whole collection.
    console.warn(
      "⚠ manifest has no documents — skipping orphan cleanup to avoid deleting every record",
    );
  } else {
    const collection = manifest.documents[0].record.$type;
    const keep = new Set(manifest.documents.map((doc) => doc.rkey));
    const existing = await listAllRecords(pds, session.did, collection);
    const orphans = computeOrphanRkeys(existing, keep);
    for (const rkey of orphans) {
      await xrpcPost(
        pds,
        "com.atproto.repo.deleteRecord",
        { repo: session.did, collection, rkey },
        session.accessJwt,
      );
      console.log(`✓ deleted orphan at://${session.did}/${collection}/${rkey}`);
      deleted += 1;
    }
    if (deleted === 0) console.log("✓ no orphaned document records to prune");
  }

  console.log(
    `\nDone — published 1 publication + ${manifest.documents.length} ` +
      `document(s)${deleted > 0 ? `, pruned ${deleted} orphan(s)` : ""}.`,
  );
}

// Only run when invoked directly (`node publish-standard-site.mjs`), not when
// imported by a test that exercises the pure helpers above.
if (argv[1] && fileURLToPath(import.meta.url) === argv[1]) {
  main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
}
