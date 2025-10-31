# Security Audit Report - WPP Digital Marketing MCP Server

**Date:** October 30, 2025
**Version:** 1.0.0
**Audited By:** Claude Code Security Analysis
**Scope:** MCP Server + OMA Integration Architecture

---

## Executive Summary

This security audit was conducted in preparation for deploying the WPP Digital Marketing MCP Server to production with OMA platform integration. The system demonstrates a solid security foundation with two-layer authorization, encrypted credentials, and AWS security best practices. However, **several critical vulnerabilities must be addressed before production deployment**, particularly the development bypass mode and CORS configuration.

**Risk Level Summary:**
- 🔴 **Critical Issues:** 3 (Must fix before production)
- 🟡 **High Severity:** 4 (Fix within first sprint)
- 🟠 **Medium Severity:** 3 (Address within first month)

**Overall Assessment:** System is NOT production-ready until critical issues are resolved.

---

## Table of Contents

1. [Critical Vulnerabilities](#critical-vulnerabilities)
2. [High Severity Issues](#high-severity-issues)
3. [Medium Severity Issues](#medium-severity-issues)
4. [BigQuery Security](#bigquery-security-oma-responsibility)
5. [Pre-Production Checklist](#pre-production-security-checklist)
6. [Action Plan](#recommended-action-plan)

---

## Critical Vulnerabilities

### 🔴 CRITICAL-1: Development Bypass Mode

**Location:** `src/gsc/middleware/oauth-validator.ts:45-48`

**Current Code:**
```typescript
if (enableBypass && req.headers['x-dev-bypass'] === 'true') {
  logger.warn('OAuth validation bypassed (development mode)');
  req.bypassAuth = true;
  return next();
}
```

**Risk:** Complete authentication bypass if `ENABLE_DEV_BYPASS=true` is set in production

**Attack Scenario:**
1. Attacker discovers production server allows bypass mode
2. Attacker sends request with `X-Dev-Bypass: true` header
3. All OAuth validation is bypassed
4. Attacker gains unrestricted access to all 65 tools across 7 APIs
5. Can access any client's Google Ads, Analytics, Search Console data

**Impact:** CRITICAL - Complete security bypass, unauthorized data access, potential data breach

**Remediation:**
```typescript
// Add production environment check
export function createOAuthValidator(options: OAuthValidatorOptions = {}) {
  const { enableBypass = false, clientId, clientSecret } = options;

  // CRITICAL: Never allow bypass in production
  if (process.env.NODE_ENV === 'production' && enableBypass) {
    throw new Error('SECURITY: Bypass mode cannot be enabled in production environment');
  }

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check for bypass mode (development only)
    if (enableBypass && req.headers['x-dev-bypass'] === 'true') {
      if (process.env.NODE_ENV === 'production') {
        logger.error('SECURITY ALERT: Bypass attempt in production blocked');
        return res.status(403).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Forbidden: Bypass mode not available'
          },
          id: null
        });
      }
      logger.warn('OAuth validation bypassed (development mode)');
      req.bypassAuth = true;
      return next();
    }
    // ... rest of validation
  };
}
```

**Verification:**
- [ ] Confirm `NODE_ENV=production` in all production environments
- [ ] Verify `ENABLE_DEV_BYPASS` is NOT set in production .env
- [ ] Test that bypass attempts in production return 403 Forbidden
- [ ] Add monitoring alert for bypass attempt logs in production

---

### 🔴 CRITICAL-2: CORS Wildcard Configuration

**Location:** `src/gsc/server-http.ts:51`

**Current Code:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
this.app.use(cors({
  origin: allowedOrigins,
  exposedHeaders: ['Mcp-Session-Id'],
  credentials: true
}));
```

**Risk:** Default configuration allows ANY origin to make authenticated requests

**Attack Scenario:**
1. Attacker creates malicious website: `evil-site.com`
2. Tricks WPP practitioner to visit site while logged into OMA
3. Malicious JavaScript makes requests to MCP server
4. CORS wildcard allows request
5. `credentials: true` includes cookies/tokens
6. Attacker steals session and exfiltrates client data

**Impact:** CRITICAL - Cross-Site Request Forgery (CSRF), data exfiltration, session hijacking

**Remediation:**
```typescript
// Strict CORS configuration for production
private setupMiddleware(): void {
  this.app.use(express.json());

  // CRITICAL: Never use wildcard in production
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  if (allowedOrigins.length === 0) {
    throw new Error('SECURITY: ALLOWED_ORIGINS must be explicitly set in production');
  }

  if (allowedOrigins.includes('*') && process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY: Wildcard CORS origin not allowed in production');
  }

  this.app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS rejected origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    exposedHeaders: ['Mcp-Session-Id'],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24 hours
  }));
}
```

**Production Configuration (.env):**
```bash
# REQUIRED: Explicit origins only
ALLOWED_ORIGINS=https://oma.wpp.com,https://staging-oma.wpp.com

# NEVER DO THIS IN PRODUCTION:
# ALLOWED_ORIGINS=*
```

**Verification:**
- [ ] Set explicit `ALLOWED_ORIGINS` in production environment
- [ ] Verify wildcard rejected with environment check
- [ ] Test CORS from unauthorized origin returns error
- [ ] Confirm only OMA domains can make requests

---

### 🔴 CRITICAL-3: Shared Secret Compromise Risk

**Location:** `src/shared/account-authorization.ts:37-49`

**Current Code:**
```typescript
const sharedSecret = process.env.OMA_MCP_SHARED_SECRET;

const expectedSignature = crypto
  .createHmac('sha256', sharedSecret)
  .update(encryptedData)
  .digest('hex');

if (signature !== expectedSignature) {
  logger.error('Invalid approved accounts signature');
  throw new Error('Invalid approved accounts signature');
}
```

**Risk:** If `OMA_MCP_SHARED_SECRET` is compromised, attackers can forge approved account lists

**Attack Scenario:**
1. Shared secret leaks via misconfigured .env, git commit, logs, or insider threat
2. Attacker creates fake approved accounts list with access to all client accounts
3. Attacker signs payload with stolen secret
4. MCP server accepts forged approved accounts
5. Attacker gains unrestricted access to any client's data

**Impact:** CRITICAL - Complete authorization bypass, access to any client account

**Current Weaknesses:**
- Symmetric secret (same key for signing and verification)
- No replay attack prevention (timestamp not validated)
- No key rotation mechanism
- Secret might be stored in plain text .env files

**Remediation:**

**Option A: Add Timestamp Validation (Quick Fix)**
```typescript
interface ApprovedAccountsPayload {
  accounts: ApprovedAccount[];
  userId: string;
  timestamp: number; // Unix timestamp
}

async loadFromEncrypted(encryptedData: string, signature: string): Promise<void> {
  try {
    const sharedSecret = process.env.OMA_MCP_SHARED_SECRET;
    if (!sharedSecret) {
      throw new Error('OMA_MCP_SHARED_SECRET not configured');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', sharedSecret)
      .update(encryptedData)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.error('Invalid approved accounts signature - possible tampering');
      throw new Error('Invalid approved accounts signature');
    }

    // Decrypt
    const decrypted = this.decrypt(encryptedData, sharedSecret);
    const data: ApprovedAccountsPayload = JSON.parse(decrypted);

    // CRITICAL: Validate timestamp to prevent replay attacks
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (!data.timestamp || Math.abs(now - data.timestamp) > maxAge) {
      logger.error('Approved accounts payload expired or invalid timestamp');
      throw new Error('Approved accounts payload expired');
    }

    this.approvedAccounts = data.accounts || [];
    this.userId = data.userId;

    // ... rest of validation
  } catch (error) {
    logger.error('Failed to load approved accounts', error as Error);
    throw error;
  }
}
```

**Option B: Asymmetric Signing (Best Practice)**
```typescript
// OMA side (private key signing)
import crypto from 'crypto';
import fs from 'fs';

const privateKey = fs.readFileSync('oma-private-key.pem', 'utf8');

function signApprovedAccounts(data: any): string {
  const payload = JSON.stringify(data);
  const sign = crypto.createSign('SHA256');
  sign.update(payload);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

// MCP side (public key verification)
const publicKey = fs.readFileSync('oma-public-key.pem', 'utf8');

function verifyApprovedAccounts(data: string, signature: string): boolean {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
}
```

**Verification:**
- [ ] Store secret in AWS Secrets Manager (not .env files)
- [ ] Implement timestamp validation (max 5 minutes age)
- [ ] Add secret rotation mechanism (90-day cycle)
- [ ] Monitor for signature validation failures
- [ ] Consider asymmetric signing for long-term security

---

## High Severity Issues

### 🟡 HIGH-4: Token Storage in localStorage

**Location:** Documentation suggests using `localStorage` for OAuth tokens

**Current Documentation:**
```typescript
// OMA-MCP-INTEGRATION.md suggests:
localStorage.setItem('access_token', tokens.access_token);
localStorage.setItem('refresh_token', tokens.refresh_token);
```

**Risk:** Tokens stored in localStorage are vulnerable to XSS attacks

**Attack Scenario:**
1. Attacker finds XSS vulnerability in OMA platform (common in web apps)
2. Injects malicious JavaScript that reads localStorage
3. Steals OAuth access tokens and refresh tokens
4. Uses stolen tokens to impersonate practitioner
5. Accesses client data, modifies campaigns, exfiltrates information

**Impact:** HIGH - Complete account takeover, data breach, unauthorized modifications

**Remediation:**

**Option A: httpOnly Cookies (Recommended)**
```typescript
// Backend sets httpOnly cookie (JavaScript cannot access)
app.post('/oauth2/callback', async (req, res) => {
  // ... exchange code for tokens

  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,      // JavaScript cannot read
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 3600000,     // 1 hour
    path: '/',
    domain: '.wpp.com'   // Subdomain sharing
  });

  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7776000000,  // 90 days
    path: '/oauth2/refresh'
  });

  res.redirect('/dashboard');
});
```

**Option B: Backend-for-Frontend (BFF) Pattern**
```typescript
// OMA backend proxies all MCP requests
// Tokens never sent to browser

// Browser → OMA Backend
const response = await fetch('/api/mcp/call-tool', {
  method: 'POST',
  credentials: 'include', // Send session cookie
  body: JSON.stringify({ tool: 'query_search_analytics', args: {...} })
});

// OMA Backend → MCP Server (with OAuth tokens)
app.post('/api/mcp/call-tool', async (req, res) => {
  const session = await getSession(req);
  const oauthToken = await getTokenForUser(session.userId);

  const mcpResponse = await fetch('http://mcp-server/mcp', {
    headers: {
      'Authorization': `Bearer ${oauthToken}`,
      'Mcp-Session-Id': session.mcpSessionId
    },
    body: JSON.stringify(req.body)
  });

  res.json(await mcpResponse.json());
});
```

**Verification:**
- [ ] Review OMA implementation plan for token storage
- [ ] Confirm httpOnly cookies or BFF pattern is used
- [ ] Never use localStorage for sensitive tokens in production
- [ ] Test XSS protection with security scanning tools

---

### 🟡 HIGH-5: No OAuth Scope Validation

**Location:** `src/gsc/middleware/oauth-validator.ts:109-128`

**Current Code:**
```typescript
async function validateGoogleToken(
  accessToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<void> {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    await oauth2.userinfo.get(); // Only checks if token is valid
  } catch (error) {
    throw new Error('Token validation failed');
  }
}
```

**Risk:** Validates token existence but not if it has required scopes for the tool being called

**Attack Scenario:**
1. Practitioner authorizes OMA with minimal scopes (e.g., only `webmasters`)
2. Attacker compromises practitioner's session
3. Calls tools requiring broader scopes (e.g., `adwords` for campaign modifications)
4. MCP server doesn't verify scopes, allows operation
5. Unauthorized access to Google Ads account

**Impact:** HIGH - Privilege escalation, unauthorized operations

**Remediation:**
```typescript
// Define required scopes per tool
const TOOL_SCOPES: Record<string, string[]> = {
  'query_search_analytics': ['https://www.googleapis.com/auth/webmasters.readonly'],
  'update_budget': ['https://www.googleapis.com/auth/adwords'],
  'run_analytics_report': ['https://www.googleapis.com/auth/analytics.readonly'],
  'create_dashboard': [], // No Google API scopes needed
  // ... all 65 tools
};

// Enhanced validation with scope checking
async function validateGoogleToken(
  accessToken: string,
  requiredScopes: string[],
  clientId?: string,
  clientSecret?: string
): Promise<void> {
  if (!clientId || !clientSecret) {
    throw new Error('OAuth client ID and secret must be configured');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    // Get token info to verify scopes
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const tokenInfo = await oauth2.tokeninfo({ access_token: accessToken });

    // Verify token is valid
    if (!tokenInfo.data.email) {
      throw new Error('Invalid token: no user email');
    }

    // Verify scopes
    const grantedScopes = tokenInfo.data.scope?.split(' ') || [];
    const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope));

    if (missingScopes.length > 0) {
      throw new Error(`Insufficient scopes. Missing: ${missingScopes.join(', ')}`);
    }

    logger.debug('Token validated with required scopes', {
      email: tokenInfo.data.email,
      requiredScopes,
      grantedScopes: grantedScopes.length
    });
  } catch (error) {
    throw new Error('Token validation failed: ' + (error as Error).message);
  }
}

// Update middleware to accept tool name and validate scopes
export function createOAuthValidator(
  options: OAuthValidatorOptions = {},
  toolName?: string
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // ... existing validation

    // Get required scopes for the tool being called
    const requiredScopes = toolName ? TOOL_SCOPES[toolName] || [] : [];

    if (requiredScopes.length > 0) {
      try {
        await validateGoogleToken(accessToken, requiredScopes, clientId, clientSecret);
      } catch (error) {
        logger.error('Scope validation failed', error as Error);
        return res.status(403).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Insufficient permissions',
            data: {
              required_scopes: requiredScopes,
              error: (error as Error).message
            }
          },
          id: null
        });
      }
    }

    next();
  };
}
```

**Verification:**
- [ ] Define required scopes for each tool
- [ ] Implement scope validation before tool execution
- [ ] Return 403 with required scopes when validation fails
- [ ] Test with token having limited scopes

---

### 🟡 HIGH-6: Session Hijacking Risk

**Location:** `src/gsc/server-http.ts:31` - Session management

**Current Code:**
```typescript
private transports: TransportMap = {};

// Sessions stored in memory with only UUID validation
const sessionId = req.headers['mcp-session-id'] as string | undefined;
if (sessionId && this.transports[sessionId]) {
  transport = this.transports[sessionId];
}
```

**Risk:** Session IDs can be stolen and reused without additional validation

**Attack Scenario:**
1. Attacker intercepts or steals session ID (network sniffing, XSS, logs)
2. Uses stolen session ID in requests from different location/device
3. MCP server accepts session without validating requester identity
4. Attacker gains access to victim's approved accounts and tools

**Impact:** HIGH - Session hijacking, unauthorized access

**Remediation:**
```typescript
interface SessionMetadata {
  transport: StreamableHTTPServerTransport;
  userId: string;
  createdAt: Date;
  lastAccess: Date;
  ipAddress: string;
  userAgent: string;
}

private sessions: Map<string, SessionMetadata> = new Map();

// Enhanced session validation
private async validateSession(
  sessionId: string,
  req: AuthenticatedRequest
): Promise<SessionMetadata | null> {
  const session = this.sessions.get(sessionId);

  if (!session) {
    logger.warn('Session not found', { sessionId });
    return null;
  }

  // Check session timeout
  const now = new Date();
  const idleTimeout = 30 * 60 * 1000; // 30 minutes
  const absoluteTimeout = 8 * 60 * 60 * 1000; // 8 hours

  const idleTime = now.getTime() - session.lastAccess.getTime();
  const absoluteTime = now.getTime() - session.createdAt.getTime();

  if (idleTime > idleTimeout) {
    logger.warn('Session expired (idle timeout)', { sessionId, idleMinutes: idleTime / 60000 });
    this.sessions.delete(sessionId);
    return null;
  }

  if (absoluteTime > absoluteTimeout) {
    logger.warn('Session expired (absolute timeout)', { sessionId, ageHours: absoluteTime / 3600000 });
    this.sessions.delete(sessionId);
    return null;
  }

  // Validate IP address (with warning, not strict enforcement)
  const currentIp = req.ip || req.socket.remoteAddress;
  if (session.ipAddress !== currentIp) {
    logger.warn('Session IP address changed', {
      sessionId,
      originalIp: session.ipAddress,
      newIp: currentIp
    });
    // Don't reject - could be mobile user switching networks
    // But log for security monitoring
  }

  // Validate User-Agent (basic fingerprinting)
  const currentUserAgent = req.headers['user-agent'];
  if (session.userAgent !== currentUserAgent) {
    logger.warn('Session User-Agent changed', {
      sessionId,
      originalUA: session.userAgent,
      newUA: currentUserAgent
    });
    // Warning only - browsers can update User-Agent
  }

  // Update last access time
  session.lastAccess = now;

  return session;
}

// Add CSRF token validation for write operations
private generateCSRFToken(sessionId: string): string {
  const secret = process.env.CSRF_SECRET || 'default-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(sessionId + Date.now())
    .digest('hex');
}

private validateCSRFToken(sessionId: string, token: string): boolean {
  // Implement CSRF token validation
  // Store tokens with sessions and validate on write operations
  return true; // Placeholder
}
```

**Verification:**
- [ ] Implement session timeout (30 min idle, 8 hours absolute)
- [ ] Add IP address tracking with monitoring (not strict enforcement)
- [ ] Implement User-Agent fingerprinting
- [ ] Add CSRF tokens for write operations
- [ ] Test session expiration works correctly

---

### 🟡 HIGH-7: No Audit Logging for Authentication Failures

**Risk:** Cannot detect brute force attacks, credential stuffing, or unauthorized access attempts

**Attack Scenario:**
1. Attacker attempts to brute force OAuth tokens or session IDs
2. Makes hundreds of failed authentication attempts
3. No logging or alerting occurs
4. Eventually succeeds or moves to next target undetected

**Impact:** HIGH - Undetected attacks, inability to respond to threats

**Remediation:**
```typescript
// Create audit logging service
interface AuthAuditLog {
  timestamp: Date;
  event: 'auth_success' | 'auth_failure' | 'session_hijack_attempt' | 'scope_violation';
  userId?: string;
  ip: string;
  userAgent: string;
  sessionId?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

class SecurityAuditLogger {
  private failureCache: Map<string, number[]> = new Map(); // IP -> timestamps

  async logAuthFailure(log: AuthAuditLog): Promise<void> {
    // Log to database/CloudWatch
    logger.warn('Authentication failure', log);

    // Track failures by IP
    const key = log.ip;
    const failures = this.failureCache.get(key) || [];
    failures.push(Date.now());

    // Keep only last hour of failures
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentFailures = failures.filter(t => t > oneHourAgo);
    this.failureCache.set(key, recentFailures);

    // Alert on suspicious patterns
    if (recentFailures.length >= 5) {
      await this.alertSecurityTeam('Multiple authentication failures', {
        ip: log.ip,
        count: recentFailures.length,
        lastAttempt: new Date(recentFailures[recentFailures.length - 1])
      });
    }

    // Auto-block after threshold
    if (recentFailures.length >= 10) {
      await this.blockIP(log.ip, '1 hour');
    }
  }

  async logAuthSuccess(log: AuthAuditLog): Promise<void> {
    logger.info('Authentication success', log);
    // Clear failure count on success
    this.failureCache.delete(log.ip);
  }

  private async alertSecurityTeam(message: string, data: any): Promise<void> {
    // Send to SNS, PagerDuty, etc.
    logger.error(`SECURITY ALERT: ${message}`, data);
  }

  private async blockIP(ip: string, duration: string): Promise<void> {
    // Add to WAF block list
    logger.error(`Auto-blocking IP due to excessive failures: ${ip} for ${duration}`);
  }
}

// Use in OAuth validator
const auditLogger = new SecurityAuditLogger();

export function createOAuthValidator(options: OAuthValidatorOptions = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // ... validation logic

      // On failure
      await auditLogger.logAuthFailure({
        timestamp: new Date(),
        event: 'auth_failure',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        reason: 'Invalid OAuth token'
      });

      return res.status(401).json({ error: 'Unauthorized' });
    } catch (error) {
      // Log error
      await auditLogger.logAuthFailure({
        timestamp: new Date(),
        event: 'auth_failure',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        reason: (error as Error).message
      });
    }

    // On success
    await auditLogger.logAuthSuccess({
      timestamp: new Date(),
      event: 'auth_success',
      userId: req.userOAuthToken ? 'authenticated' : 'unknown',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    next();
  };
}
```

**Verification:**
- [ ] Log all authentication attempts (success and failure)
- [ ] Track failure patterns by IP address
- [ ] Alert security team on suspicious patterns (5+ failures/hour)
- [ ] Auto-block IPs after 10 failures in 1 hour
- [ ] Integrate with CloudWatch/DataDog for monitoring

---

## Medium Severity Issues

### 🟠 MEDIUM-8: In-Memory Session Storage

**Location:** `src/gsc/server-http.ts:31`

**Risk:**
- Sessions lost on server restart
- Memory leaks if cleanup not implemented
- Cannot scale horizontally (sessions tied to single instance)

**Impact:** MEDIUM - Poor production scalability, user disruption

**Remediation:**
```typescript
import { createClient } from 'redis';

class SessionStore {
  private redis: ReturnType<typeof createClient>;

  async connect(): Promise<void> {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await this.redis.connect();
  }

  async storeSession(sessionId: string, metadata: SessionMetadata): Promise<void> {
    const ttl = 8 * 60 * 60; // 8 hours
    await this.redis.setEx(
      `session:${sessionId}`,
      ttl,
      JSON.stringify(metadata)
    );
  }

  async getSession(sessionId: string): Promise<SessionMetadata | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  async updateSessionAccess(sessionId: string): Promise<void> {
    const ttl = 30 * 60; // 30 minutes idle timeout
    await this.redis.expire(`session:${sessionId}`, ttl);
  }
}
```

**Verification:**
- [ ] Set up Redis for production session storage
- [ ] Implement session serialization/deserialization
- [ ] Test session persistence across server restarts
- [ ] Verify horizontal scaling works with multiple instances

---

### 🟠 MEDIUM-9: No Application-Level Rate Limiting

**Risk:** API abuse, quota exhaustion, denial of service

**Impact:** MEDIUM - Service degradation, increased costs, poor user experience

**Remediation:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limit (all requests)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Too many requests. Please try again later.',
        data: { retryAfter: 60 }
      },
      id: null
    });
  }
});

// Stricter limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  })
});

// Per-user rate limit (after authentication)
const perUserLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // 60 requests per minute per user
  keyGenerator: (req: AuthenticatedRequest) => {
    return req.userOAuthToken || req.ip || 'anonymous';
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  })
});

// Apply rate limiters
app.use('/mcp', globalLimiter);
app.use('/mcp', perUserLimiter);
```

**Verification:**
- [ ] Implement rate limiting on all MCP endpoints
- [ ] Test that limits are enforced correctly
- [ ] Verify 429 responses include retry-after information
- [ ] Monitor rate limit hits in production

---

### 🟠 MEDIUM-10: Error Information Disclosure

**Risk:** Stack traces and detailed errors might leak implementation details

**Impact:** MEDIUM - Information leakage aids attackers

**Remediation:**
```typescript
// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error details server-side
  logger.error('Unhandled error', {
    error: err,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send generic error to client
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    jsonrpc: '2.0',
    error: {
      code: -32603,
      message: isProduction
        ? 'Internal server error'
        : err.message,
      data: isProduction
        ? undefined
        : { stack: err.stack }
    },
    id: null
  });
});

// Sanitize OAuth tokens from logs
logger.addTransformer((log) => {
  if (log.headers?.authorization) {
    log.headers.authorization = 'Bearer [REDACTED]';
  }
  if (log.userOAuthToken) {
    log.userOAuthToken = '[REDACTED]';
  }
  return log;
});
```

**Verification:**
- [ ] Verify stack traces not sent in production responses
- [ ] Confirm OAuth tokens scrubbed from logs
- [ ] Test error handling returns generic messages
- [ ] Review CloudWatch logs for sensitive data leakage

---

## BigQuery Security (OMA Responsibility)

Since OMA team will handle BigQuery data collection, ensure these security measures:

### 🔵 BIGQUERY-1: Service Account Least Privilege

**Required Actions:**
```bash
# Create service account with minimal permissions
gcloud iam service-accounts create oma-bigquery-readonly \
  --display-name="OMA BigQuery Read-Only"

# Grant only necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:oma-bigquery-readonly@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:oma-bigquery-readonly@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"

# DO NOT GRANT:
# - bigquery.admin
# - bigquery.dataEditor
# - bigquery.dataOwner
```

**Verification:**
- [ ] Service account has only `dataViewer` + `jobUser` roles
- [ ] No admin or editor permissions granted
- [ ] Service account key stored in secure vault (not .env)
- [ ] Key rotation enabled (90-day cycle)

---

### 🔵 BIGQUERY-2: Row-Level Security (RLS)

**Required Actions:**
```sql
-- Create row-level access policy to enforce workspace isolation
CREATE ROW ACCESS POLICY workspace_filter
ON `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
GRANT TO ('serviceAccount:oma@project.iam.gserviceaccount.com')
FILTER USING (
  workspace_id = SESSION_USER()
);

-- Test RLS enforcement
-- This should only return rows for workspace-abc
SET SESSION workspace_id = 'workspace-abc';
SELECT COUNT(*) FROM `mcp-servers-475317.wpp_marketing.gsc_performance_shared`;
```

**Verification:**
- [ ] RLS policies applied to all shared tables
- [ ] Test cross-workspace access blocked
- [ ] Verify `workspace_id` filtering enforced at database level
- [ ] Document RLS configuration for all tables

---

### 🔵 BIGQUERY-3: Audit Logging

**Required Actions:**
```bash
# Enable BigQuery audit logs
gcloud logging write test-log "test" --severity=INFO

# Create log sink for security monitoring
gcloud logging sinks create bigquery-security-audit \
  bigquery.googleapis.com/projects/PROJECT_ID/datasets/audit_logs \
  --log-filter='resource.type="bigquery_resource" AND protoPayload.methodName="jobservice.query"'

# Alert on suspicious patterns
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cross-workspace query attempt" \
  --condition-filter='resource.type="bigquery_resource" AND protoPayload.metadata.jobChange.job.jobStats.queryStats.referencedTables.tableId!~".*workspace_id.*"'
```

**Verification:**
- [ ] BigQuery audit logs enabled
- [ ] Logs exported to secure storage
- [ ] Alerts configured for unusual access patterns
- [ ] Weekly review of audit logs scheduled

---

### 🔵 BIGQUERY-4: Data Encryption

**Required Actions:**
```bash
# Use customer-managed encryption keys (CMEK) for sensitive data
gcloud kms keyrings create wpp-bigquery-keys \
  --location=us-central1

gcloud kms keys create bigquery-encryption-key \
  --location=us-central1 \
  --keyring=wpp-bigquery-keys \
  --purpose=encryption

# Apply CMEK to datasets
bq update --encryption_kms_key \
  projects/PROJECT_ID/locations/us-central1/keyRings/wpp-bigquery-keys/cryptoKeys/bigquery-encryption-key \
  PROJECT_ID:wpp_marketing
```

**Verification:**
- [ ] CMEK configured for sensitive client data
- [ ] Key rotation enabled (automatic 90 days)
- [ ] Key access audited and monitored
- [ ] TLS 1.3 enforced for data in transit

---

## Pre-Production Security Checklist

Use this checklist before deploying to production with OMA:

### Phase 1: Critical Security Fixes (MUST COMPLETE)

#### Authentication & Authorization
- [ ] **CRITICAL-1**: Verify `ENABLE_DEV_BYPASS` is FALSE or unset in production
- [ ] **CRITICAL-1**: Add production environment check to reject bypass attempts
- [ ] **CRITICAL-1**: Test bypass mode returns 403 in production environment
- [ ] **CRITICAL-2**: Set explicit `ALLOWED_ORIGINS` (no wildcards)
- [ ] **CRITICAL-2**: Verify CORS only allows OMA domains
- [ ] **CRITICAL-2**: Test CORS rejects unauthorized origins
- [ ] **CRITICAL-3**: Store `OMA_MCP_SHARED_SECRET` in AWS Secrets Manager
- [ ] **CRITICAL-3**: Implement timestamp validation (5 min max age)
- [ ] **CRITICAL-3**: Set up secret rotation (90-day cycle)
- [ ] **CRITICAL-3**: Consider asymmetric signing for long-term

#### OAuth Security
- [ ] **HIGH-4**: Implement httpOnly cookies or BFF pattern (no localStorage)
- [ ] **HIGH-4**: Verify tokens not accessible to JavaScript
- [ ] **HIGH-4**: Test XSS protection with security tools
- [ ] **HIGH-5**: Implement OAuth scope validation per tool
- [ ] **HIGH-5**: Return 403 with required scopes when insufficient
- [ ] **HIGH-5**: Test tools with limited-scope tokens

#### Session Management
- [ ] **HIGH-6**: Implement session timeout (30 min idle, 8 hour absolute)
- [ ] **HIGH-6**: Add IP address tracking with monitoring
- [ ] **HIGH-6**: Implement User-Agent fingerprinting
- [ ] **HIGH-6**: Test session expiration works correctly
- [ ] **HIGH-7**: Implement audit logging for all auth events
- [ ] **HIGH-7**: Set up alerts for failed authentication patterns (5+/hour)
- [ ] **HIGH-7**: Test auto-blocking after 10 failures

### Phase 2: Infrastructure Security (AWS)

#### Network Security
- [ ] VPC isolation (private subnets for ECS tasks)
- [ ] Security groups with least privilege rules
- [ ] WAF enabled with rate limiting rules
- [ ] GuardDuty enabled for threat detection
- [ ] NACLs configured for additional protection

#### Secrets Management
- [ ] All secrets in AWS Secrets Manager (not .env)
- [ ] Automatic secret rotation enabled
- [ ] IAM roles with least privilege for secret access
- [ ] CloudTrail logging all secret accesses
- [ ] Secrets never logged or exposed in errors

#### TLS/HTTPS Configuration
- [ ] TLS 1.3 enforced (TLS 1.2 minimum)
- [ ] Valid SSL certificates from ACM
- [ ] HSTS headers enabled
- [ ] Redirect HTTP to HTTPS
- [ ] Certificate auto-renewal verified

#### Monitoring & Logging
- [ ] CloudWatch logs enabled for all services
- [ ] Log retention policy set (90 days minimum)
- [ ] Sensitive data scrubbed from logs
- [ ] CloudWatch alarms for critical errors
- [ ] GuardDuty alerts routed to security team

### Phase 3: Application Security

#### Rate Limiting
- [ ] **MEDIUM-9**: Global rate limit (100 req/min per IP)
- [ ] **MEDIUM-9**: Per-user rate limit (60 req/min)
- [ ] **MEDIUM-9**: Auth endpoint limit (5 attempts/15 min)
- [ ] **MEDIUM-9**: Test 429 responses with retry-after headers

#### Session Storage
- [ ] **MEDIUM-8**: Redis configured for session storage
- [ ] **MEDIUM-8**: Session serialization implemented
- [ ] **MEDIUM-8**: Test persistence across restarts
- [ ] **MEDIUM-8**: Verify horizontal scaling works

#### Error Handling
- [ ] **MEDIUM-10**: Generic errors in production (no stack traces)
- [ ] **MEDIUM-10**: Detailed errors logged server-side only
- [ ] **MEDIUM-10**: OAuth tokens scrubbed from logs
- [ ] **MEDIUM-10**: Test error responses don't leak info

### Phase 4: BigQuery Security (OMA Team)

#### Access Control
- [ ] **BIGQUERY-1**: Service account with least privilege
- [ ] **BIGQUERY-1**: Only `dataViewer` + `jobUser` roles granted
- [ ] **BIGQUERY-1**: Service account key in secure vault
- [ ] **BIGQUERY-1**: Key rotation enabled (90 days)

#### Data Isolation
- [ ] **BIGQUERY-2**: Row-level security policies applied
- [ ] **BIGQUERY-2**: Workspace_id filtering enforced
- [ ] **BIGQUERY-2**: Test cross-workspace access blocked
- [ ] **BIGQUERY-2**: RLS documented for all tables

#### Audit & Monitoring
- [ ] **BIGQUERY-3**: BigQuery audit logs enabled
- [ ] **BIGQUERY-3**: Logs exported to secure storage
- [ ] **BIGQUERY-3**: Alerts for unusual access patterns
- [ ] **BIGQUERY-3**: Weekly audit log review scheduled

#### Encryption
- [ ] **BIGQUERY-4**: CMEK enabled for sensitive data
- [ ] **BIGQUERY-4**: Key rotation enabled
- [ ] **BIGQUERY-4**: TLS 1.3 enforced in transit
- [ ] **BIGQUERY-4**: Encryption verified for all datasets

### Phase 5: Testing & Validation

#### Security Testing
- [ ] Penetration testing by OMA security team
- [ ] OWASP Top 10 vulnerability scanning
- [ ] Dependency vulnerability scanning (Snyk/Dependabot)
- [ ] SQL injection testing (if applicable)
- [ ] XSS testing on all user inputs
- [ ] CSRF testing on write operations
- [ ] Session hijacking testing
- [ ] Token theft/replay testing

#### Load Testing
- [ ] Test 1000+ concurrent users
- [ ] Verify rate limiting under load
- [ ] Test session storage scalability
- [ ] Verify horizontal scaling works
- [ ] Test failover scenarios

#### Compliance Testing
- [ ] GDPR compliance review
- [ ] Data residency verification
- [ ] User consent tracking
- [ ] Right to deletion capability
- [ ] Data export capability
- [ ] Audit trail completeness

### Phase 6: Documentation & Training

#### Security Documentation
- [ ] Security architecture documented
- [ ] Threat model documented
- [ ] Incident response plan created
- [ ] Security contact information distributed
- [ ] Escalation procedures defined

#### Training
- [ ] OMA team trained on security features
- [ ] Security team trained on monitoring
- [ ] Incident response drill conducted
- [ ] Security best practices documented
- [ ] User security guidelines created

### Phase 7: Production Readiness

#### Final Verification
- [ ] All CRITICAL issues resolved (no exceptions)
- [ ] All HIGH issues resolved or accepted risk documented
- [ ] All MEDIUM issues scheduled for first month
- [ ] Security team sign-off obtained
- [ ] OMA DevOps team sign-off obtained
- [ ] Go/No-Go meeting completed

#### Deployment
- [ ] Production environment configured
- [ ] Secrets deployed to AWS Secrets Manager
- [ ] Monitoring dashboards created
- [ ] Alert routing verified
- [ ] Rollback plan documented and tested
- [ ] On-call rotation established

#### Post-Deployment
- [ ] Monitor for 24 hours with engineering on-call
- [ ] Review security logs daily for first week
- [ ] Schedule 30-day security review
- [ ] Schedule 90-day penetration test
- [ ] Plan quarterly security audits

---

## Recommended Action Plan

### Immediate (Week 1) - CRITICAL BLOCKERS

**Owner:** MCP Server Team
**Timeline:** Before any production deployment

1. **Fix Development Bypass Mode**
   - Add production environment check
   - Test rejection in production
   - Document bypass mode risks
   - **Status:** 🔴 BLOCKING

2. **Fix CORS Configuration**
   - Set explicit allowed origins
   - Remove wildcard support in production
   - Test CORS enforcement
   - **Status:** 🔴 BLOCKING

3. **Secure Shared Secret**
   - Move to AWS Secrets Manager
   - Implement timestamp validation
   - Plan rotation schedule
   - **Status:** 🔴 BLOCKING

**Success Criteria:** All critical vulnerabilities resolved, security team sign-off obtained

---

### Short-term (Weeks 2-4) - HIGH PRIORITY

**Owner:** MCP Server Team + OMA Team
**Timeline:** First sprint after deployment

4. **Implement Token Security**
   - OMA implements httpOnly cookies or BFF pattern
   - Test XSS protection
   - **Status:** 🟡 HIGH

5. **Add Scope Validation**
   - Define scopes for all 65 tools
   - Implement validation middleware
   - Test with limited tokens
   - **Status:** 🟡 HIGH

6. **Enhance Session Security**
   - Implement session timeouts
   - Add IP tracking and User-Agent validation
   - Test session hijacking protections
   - **Status:** 🟡 HIGH

7. **Implement Audit Logging**
   - Log all authentication events
   - Set up failure pattern detection
   - Configure auto-blocking
   - Integrate with CloudWatch
   - **Status:** 🟡 HIGH

**Success Criteria:** All high-priority issues resolved, monitoring in place

---

### Medium-term (Month 2) - MEDIUM PRIORITY

**Owner:** MCP Server Team + DevOps
**Timeline:** Second month of production

8. **Implement Redis Session Store**
   - Set up Redis cluster
   - Migrate session storage
   - Test horizontal scaling
   - **Status:** 🟠 MEDIUM

9. **Add Rate Limiting**
   - Global and per-user limits
   - Redis-based rate limit store
   - Test 429 responses
   - **Status:** 🟠 MEDIUM

10. **Improve Error Handling**
    - Generic production errors
    - Token scrubbing in logs
    - Comprehensive error monitoring
    - **Status:** 🟠 MEDIUM

**Success Criteria:** All medium-priority issues resolved, system scalable

---

### Long-term (Ongoing) - MAINTENANCE

**Owner:** Security Team + DevOps
**Timeline:** Continuous

11. **Regular Security Audits**
    - Quarterly penetration testing
    - Monthly dependency scans
    - Quarterly architecture reviews
    - **Status:** 🔵 ONGOING

12. **Secret Rotation**
    - Automated 90-day rotation
    - Emergency rotation procedures
    - Audit rotation compliance
    - **Status:** 🔵 ONGOING

13. **Security Monitoring**
    - Real-time threat detection
    - Weekly audit log review
    - Monthly security metrics
    - **Status:** 🔵 ONGOING

14. **Training & Documentation**
    - Quarterly security training
    - Update security documentation
    - Incident response drills
    - **Status:** 🔵 ONGOING

**Success Criteria:** Security posture maintained, no incidents

---

## Incident Response Plan

### Security Incident Severity Levels

**P0 - Critical (Response time: <15 minutes)**
- Active breach or data exfiltration
- Shared secret compromised
- Production bypass mode enabled
- Multiple simultaneous attacks

**P1 - High (Response time: <1 hour)**
- Unauthorized access to client data
- OAuth token theft
- Session hijacking detected
- DDoS attack in progress

**P2 - Medium (Response time: <4 hours)**
- Failed authentication patterns (10+/hour)
- Unusual access patterns detected
- Service degradation
- Cross-workspace access attempts

**P3 - Low (Response time: <24 hours)**
- Single failed authentication
- Minor configuration issues
- Non-critical security alerts

### Response Procedures

**Immediate Actions (First 15 minutes):**
1. Confirm incident is real (not false positive)
2. Page on-call security engineer
3. Enable enhanced logging
4. Capture evidence (logs, network traces)
5. Isolate affected systems if necessary

**Investigation Phase (Next hour):**
1. Identify attack vector and scope
2. Determine compromised data/accounts
3. Track attacker activity
4. Assess ongoing risk

**Containment Phase (Next 2 hours):**
1. Block attacker access (IP block, token revocation)
2. Rotate compromised credentials
3. Patch vulnerability if identified
4. Deploy emergency fixes

**Recovery Phase (Next 24 hours):**
1. Verify attacker removed from systems
2. Restore normal operations
3. Validate security controls
4. Monitor for re-entry attempts

**Post-Incident Phase (Next week):**
1. Complete incident report
2. Root cause analysis
3. Implement preventive measures
4. Update security documentation
5. Conduct team debrief

---

## Security Contacts

**Central Security Team:**
- Email: security@wpp.com
- Slack: #wpp-security-incidents
- PagerDuty: WPP Security On-Call

**MCP Server Team:**
- Email: mcp-team@wpp.com
- Slack: #mcp-server-dev
- On-Call: mcp-oncall@wpp.com

**OMA Platform Team:**
- Email: oma-team@wpp.com
- Slack: #oma-platform
- On-Call: oma-oncall@wpp.com

**Emergency Procedures:**
- P0 Incident: Page security team + CTO
- Potential Breach: Immediately contact legal@wpp.com
- Media Inquiry: PR team pr@wpp.com

---

## References

**Security Standards:**
- OWASP Top 10: https://owasp.org/Top10/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- OAuth 2.0 Security Best Practices: https://tools.ietf.org/html/rfc8252

**WPP Documentation:**
- AWS Deployment Guide: `docs/architecture/AWS-DEPLOYMENT-GUIDE.md`
- OMA Integration Architecture: `docs/architecture/OMA-MCP-INTEGRATION.md`
- MCP HTTP Server Guide: `MCP-HTTP-SERVER-GUIDE.md`

**Audit History:**
- Initial Audit: October 30, 2025
- Next Review: January 30, 2026 (Quarterly)

---

## Appendix: Security Testing Scripts

### Test Bypass Mode Rejection

```bash
#!/bin/bash
# Test that bypass mode is rejected in production

export NODE_ENV=production
export ENABLE_DEV_BYPASS=true

# Start server (should fail or log warning)
npm run start:http

# If server starts, test that bypass attempts return 403
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "X-Dev-Bypass: true" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}'

# Expected: 403 Forbidden
```

### Test CORS Configuration

```bash
#!/bin/bash
# Test CORS only allows specific origins

# Should succeed
curl -X POST http://localhost:3000/mcp \
  -H "Origin: https://oma.wpp.com" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# Should fail (CORS error)
curl -X POST http://localhost:3000/mcp \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'

# Expected: Second request rejected by CORS
```

### Test Session Timeout

```bash
#!/bin/bash
# Test session expires after 30 minutes

# Initialize session
RESPONSE=$(curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "X-Dev-Bypass: true" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}')

SESSION_ID=$(echo $RESPONSE | jq -r '.headers["Mcp-Session-Id"]')

# Wait 31 minutes
sleep 1860

# Try to use expired session
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}'

# Expected: Session expired error
```

### Test Rate Limiting

```bash
#!/bin/bash
# Test rate limiting enforcement

for i in {1..101}; do
  curl -X POST http://localhost:3000/mcp \
    -H "Content-Type: application/json" \
    -H "X-Dev-Bypass: true" \
    -d '{"jsonrpc": "2.0", "id": '$i', "method": "tools/list"}'
  sleep 0.1
done

# Expected: Requests 101+ return 429 Too Many Requests
```

---

**End of Security Audit Report**

**Next Steps:**
1. Review this report with security team
2. Prioritize fixes based on severity
3. Update JIRA/Linear with security tasks
4. Schedule security review meeting
5. Begin implementation of critical fixes

**Report Status:** 🔴 CRITICAL ISSUES FOUND - NOT PRODUCTION READY
