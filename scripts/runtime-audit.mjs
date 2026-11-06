#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** `npm audit --omit=dev --json` contains runtime dependency advisories only. */
export function evaluateAudit(report) {
  if (!report || typeof report !== "object" ||
      !report.vulnerabilities || typeof report.vulnerabilities !== "object") {
    return { ok: false, findings: [], error: "audit report unavailable" };
  }

  const findings = Object.entries(report.vulnerabilities).map(([packageName, item]) => {
    const advisory = Array.isArray(item?.via)
      ? item.via.find((entry) => entry && typeof entry === "object" && typeof entry.url === "string")
      : null;
    return {
      packageName,
      severity: typeof item?.severity === "string" ? item.severity : "unknown",
      url: advisory?.url ?? "",
    };
  });
  return {
    ok: findings.every((finding) => !["high", "critical", "unknown"].includes(finding.severity)),
    findings,
  };
}

function main() {
  const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  let report;
  try {
    report = JSON.parse(result.stdout || "");
  } catch {
    console.error("runtime audit failed: report unavailable");
    process.exit(1);
  }
  const decision = evaluateAudit(report);
  if (result.error || decision.error) {
    console.error(`runtime audit failed: ${decision.error ?? "command unavailable"}`);
    process.exit(1);
  }

  for (const finding of decision.findings) {
    console.log(`${finding.severity}: ${finding.packageName}${finding.url ? ` · ${finding.url}` : ""}`);
  }
  console.log(decision.ok ? "runtime audit passed" : "runtime audit failed: high or critical advisory");
  process.exit(decision.ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
