const fs = require("fs");
const path = require("path");

function extractPaths(value, acc = []) {
  if (typeof value === "string") {
    if (/src[/\\]features[/\\]/.test(value) && /\.tsx?$/.test(value)) {
      acc.push(value);
    }
    return acc;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => extractPaths(item, acc));
    return acc;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (
        /^(path|file_path|filePath|uri|target)$/i.test(key) &&
        typeof nested === "string"
      ) {
        acc.push(nested);
      } else {
        extractPaths(nested, acc);
      }
    }
  }

  return acc;
}

function normalize(filePath) {
  return filePath.replace(/\\/g, "/");
}

function isFeatureUiComponent(filePath) {
  const normalized = normalize(filePath);
  if (normalized.includes(".test.")) return false;
  return /(?:^|\/)src\/features\/.+\/ui\/[^/]+\.tsx$/.test(normalized);
}

function toTestPath(filePath) {
  return filePath.replace(/\.tsx?$/, ".test.tsx");
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let payload = {};
  try {
    payload = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  const missing = [
    ...new Set(extractPaths(payload).map((item) => path.resolve(item))),
  ].filter((filePath) => {
    if (!isFeatureUiComponent(filePath)) return false;
    if (!fs.existsSync(filePath)) return false;
    return !fs.existsSync(toTestPath(filePath));
  });

  if (missing.length === 0) {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  const relative = missing.map((filePath) =>
    normalize(path.relative(process.cwd(), filePath) || filePath),
  );

  const message = [
    "Missing tests for:",
    ...relative.map((filePath) => `- ${filePath}`),
    "Add a colocated `.test.tsx` (Vitest + RTL) using the Senior QA Automation Engineer skill: AAA, role-first queries, happy path, edge cases, errors, a11y. Do not use CSS/tag selectors or hardcoded timeouts.",
    "Also follow the global React Performance Optimization skill: useMemo for heavy work, useCallback when children are memoized, split Context state/dispatch, dynamic() for heavy/rare UI, cleanup in useEffect. Report as Проблема / Причина / Решение.",
  ].join("\n");

  process.stderr.write(`Missing tests for: ${relative.join(", ")}\n`);
  process.stdout.write(
    JSON.stringify({
      additional_context: message,
      agent_message: message,
    }) + "\n",
  );
  process.exit(0);
});
