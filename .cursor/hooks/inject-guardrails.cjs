process.stdin.resume();
process.stdin.on('end', () => {
  let payload = {};
  try {
    payload = JSON.parse(process.stdin.read() ?? '{}');
  } catch {
    payload = {};
  }

  const prompt = String(payload.prompt ?? payload.text ?? payload.message ?? '').toLowerCase();
  const injections = [];

  const secretPatterns = [
    /\.env(\.|$|\s)/,
    /api[_-]?key\s*[=:]/,
    /secret\s*[=:]/,
    /password\s*[=:]/,
    /private[_-]?key/,
    /-----begin (rsa |openssh )?private key-----/,
    /sk-[a-z0-9]{20,}/,
    /ghp_[a-z0-9]{20,}/,
  ];

  if (secretPatterns.some((pattern) => pattern.test(prompt))) {
    injections.push(
      'Guardrail: не коммить секреты (.env, API keys, tokens, private keys). Убери чувствительные данные из diff перед git add/commit.',
    );
  }

  const gitShellPattern = /\bgit\s+(add|commit|push|pull|checkout|branch|merge|rebase|stash|reset|worktree)\b/;
  const mentionsGitKrakenMcp = /gitlens|gitkraken|git_worktree|git_status|git_branch|git_commit|git_log_or_diff/.test(
    prompt,
  );

  if (gitShellPattern.test(prompt) && !mentionsGitKrakenMcp) {
    injections.push(
      'Guardrail: локальный git в этом репозитории — через GitLens MCP (git_status, git_worktree, git_branch, git_log_or_diff). Не дублируй git worktree в shell, если MCP доступен.',
    );
  }

  if (injections.length === 0) {
    process.exit(0);
    return;
  }

  const message = injections.join(' ');

  process.stdout.write(
    JSON.stringify({
      additional_context: message,
      agent_message: message,
    }) + '\n',
  );
  process.exit(0);
});
