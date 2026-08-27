process.stdin.resume();
process.stdin.on("end", () => {
  const message = [
    "If this session does meaningful work, append an entry to reports/sessions.md.",
    "Template: Когда / Цель / Сделано / Решение / Дальше.",
    "Do not skip the journal when closing a homework or workflow task.",
  ].join(" ");

  process.stdout.write(
    JSON.stringify({
      additional_context: message,
      agent_message: message,
    }) + "\n",
  );
  process.exit(0);
});
