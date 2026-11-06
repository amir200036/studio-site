import { createHmac } from "node:crypto";

export type SecurityEvent =
  | "admin_login_rate_limited"
  | "authorization_rejected"
  | "database_query_failed"
  | "database_verification"
  | "development_route_rejected"
  | "environment_validation_failed"
  | "upload_rejected";

export type SecurityLogFields = Record<string, unknown>;

type SecurityLogOptions = {
  now?: Date;
  fingerprintSecret?: string;
};

export type SecurityLogEntry = {
  event: SecurityEvent;
  timestamp: string;
  route?: string;
  method?: string;
  status?: number;
  environment?: string;
  outcome?: string;
  category?: string;
  correlationId?: string;
  host?: string;
  ipFingerprint?: string;
};

const ALLOWED_TEXT_FIELDS = [
  "route",
  "method",
  "environment",
  "outcome",
  "category",
  "correlationId",
  "host",
] as const;

export function createSecurityLogEntry(
  event: SecurityEvent,
  fields: SecurityLogFields = {},
  options: SecurityLogOptions = {}
): SecurityLogEntry {
  const entry: SecurityLogEntry = {
    event,
    timestamp: (options.now ?? new Date()).toISOString(),
  };

  for (const key of ALLOWED_TEXT_FIELDS) {
    if (typeof fields[key] === "string" && fields[key]) entry[key] = fields[key];
  }
  if (typeof fields.status === "number" && Number.isInteger(fields.status)) {
    entry.status = fields.status;
  }

  if (typeof fields.ip === "string" && fields.ip) {
    const secret =
      options.fingerprintSecret ??
      process.env.SECURITY_LOG_SALT ??
      process.env.NEXTAUTH_SECRET ??
      "local-security-log";
    entry.ipFingerprint = createHmac("sha256", secret)
      .update(fields.ip)
      .digest("hex")
      .slice(0, 16);
  }

  return entry;
}

export function securityLog(event: SecurityEvent, fields: SecurityLogFields = {}): void {
  console.warn(JSON.stringify(createSecurityLogEntry(event, fields)));
}
