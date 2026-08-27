const { spawnSync } = require("child_process");
const path = require("path");

function extractPaths(value, acc = []) {
  if (typeof value === "string") {
    if (/\.(?:ts|tsx|css)$/.test(value) && /(?:^|[/\\])src[/\\]/.test(value)) {
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

function isSrcTs(filePath) {
  return /(?:^|\/)src\/.+\.(?:ts|tsx)$/.test(normalize(filePath));
}

function isSrcCss(filePath) {
  return /(?:^|\/)src\/.+\.css$/.test(normalize(filePath));
}

function runNpm(script) {
  return spawnSync("npm", ["run", script], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
    timeout: 90_000,
  });
}

function formatResult(script, result) {
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.status === 0) {
    return null;
  }

  return [`\`${script}\` failed:`, output || `exit ${result.status}`].join(
    "\n",
  );
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

  const paths = [...new Set(extractPaths(payload).map((item) => path.resolve(item)))];
  const needTs = paths.some((item) => isSrcTs(item));
  const needCss = paths.some((item) => isSrcCss(item));

  if (!needTs && !needCss) {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  const parts = [];
  if (needTs) {
    const message = formatResult("ts-check", runNpm("ts-check"));
    if (message) {
      parts.push(message);
    }
  }
  if (needCss) {
    const message = formatResult("lint:styles", runNpm("lint:styles"));
    if (message) {
      parts.push(message);
    }
  }

  if (parts.length === 0) {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  const message = parts.join("\n\n");
  process.stderr.write(`${message}\n`);
  process.stdout.write(
    JSON.stringify({
      additional_context: message,
      agent_message: message,
    }) + "\n",
  );
  process.exit(0);
});
