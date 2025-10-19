# AWS Deployment Guide - WPP Digital Marketing MCP Server

**Target Infrastructure:** AWS ECS Fargate + Cognito + API Gateway
**Deployment Method:** AWS CDK (Infrastructure as Code)
**Estimated Setup Time:** 2-3 days for experienced AWS engineer
**Monthly Cost:** ~$900-1,020 (3 environments)

---

## WHY AWS

### Comparison Matrix:

| Feature | AWS | Google Cloud | Azure | Vercel/Railway |
|---------|-----|--------------|-------|----------------|
| **MCP Guidance** | ✅ Official AWS guidance exists | ⚠️ Limited | ⚠️ Limited | ❌ Not designed for this |
| **CLI Quality** | ✅ Excellent (CDK) | ✅ Good (gcloud) | ✅ Good (az) | ⚠️ Limited |
| **OAuth Integration** | ✅ Cognito (built-in) | ✅ Identity Platform | ✅ AD B2C | ❌ Bring your own |
| **Serverless Containers** | ✅ Fargate | ✅ Cloud Run | ✅ Container Instances | ✅ Yes |
| **Secrets Management** | ✅ Secrets Manager | ✅ Secret Manager | ✅ Key Vault | ⚠️ Basic |
| **Monitoring** | ✅ CloudWatch (mature) | ✅ Cloud Monitoring | ✅ Monitor | ⚠️ Limited |
| **Security** | ✅ WAF, GuardDuty, etc. | ✅ Cloud Armor, etc. | ✅ Security Center | ❌ Basic |
| **Cost (3 envs)** | ~$900/month | ~$850/month | ~$950/month | ~$300/month* |
| **Enterprise Support** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Multi-Region** | ✅ Global | ✅ Global | ✅ Global | ⚠️ Limited |

*Vercel/Railway cheaper but lack enterprise features

**Recommendation: AWS**
- Official MCP deployment patterns published
- Most mature tooling (CDK)
- Best security features (GuardDuty, WAF)
- Proven at WPP's scale

**Alternative: Google Cloud**
- Pros: Tighter Google API integration, similar features
- Cons: Less MCP-specific documentation
- Would work well, but AWS has more MCP deployment experience

---

## COMPLETE INFRASTRUCTURE ARCHITECTURE

### High-Level Components:

```
Internet/OMA Platform
        ↓
    CloudFront (CDN + DDoS protection)
        ↓
    WAF (Web Application Firewall - rate limiting, geo-blocking)
        ↓
    API Gateway (HTTPS endpoints, Lambda authorizer)
        ↓
    Application Load Balancer (Private, multi-AZ)
        ↓
    ECS Fargate Tasks (MCP server containers, auto-scaling)
        ↓
    ├─→ DynamoDB (approved accounts, audit logs, snapshots)
    ├─→ Secrets Manager (OAuth credentials, API keys)
    ├─→ SES (email notifications)
    ├─→ CloudWatch (logs, metrics, alarms)
    └─→ Google APIs (via internet through NAT Gateway)
```

### AWS CDK Infrastructure Code:

**File: `infrastructure/lib/wpp-mcp-stack.ts`**

Complete implementation provided in appendix (see end of document).

---

## DETAILED COMPONENT SPECIFICATIONS

### 1. VPC (Virtual Private Cloud)

```
Configuration:
- CIDR: 10.0.0.0/16
- Availability Zones: 3 (us-east-1a, us-east-1b, us-east-1c)

Subnets:
- Public Subnets (3): 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24
  * Contains: NAT Gateways only
  * Internet Gateway attached

- Private Subnets (3): 10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24
  * Contains: ECS Fargate tasks (MCP servers)
  * Internet access via NAT Gateways (for calling Google APIs)
  * NO direct internet access

- Database Subnets (3): 10.0.21.0/24, 10.0.22.0/24, 10.0.23.0/24
  * Contains: DynamoDB VPC endpoints, RDS (if used)
  * NO internet access
  * Isolated from application subnets

NAT Gateways (3):
- One per AZ
- Elastic IPs attached
- Used by MCP servers to call Google APIs
- Cost: ~$33/month each = ~$100/month total
```

### 2. ECS Fargate Cluster

```
Cluster Name: wpp-mcp-cluster
Container Insights: Enabled (for detailed monitoring)

Service: wpp-mcp-service
  Task Definition: wpp-mcp-task
    - Family: wpp-mcp-server
    - CPU: 1024 (1 vCPU)
    - Memory: 2048 MB (2 GB)
    - Network Mode: awsvpc

  Container: mcp-server
    - Image: {account}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:latest
    - Port: 3000
    - Environment:
      * NODE_ENV: production
      * LOG_LEVEL: INFO
    - Secrets (from Secrets Manager):
      * GOOGLE_CLIENT_ID
      * GOOGLE_CLIENT_SECRET
      * GOOGLE_ADS_DEVELOPER_TOKEN
      * CRUX_API_KEY
      * OMA_API_KEY
      * DB_CONNECTION_STRING
    - Health Check:
      * Command: CMD-SHELL, curl -f http://localhost:3000/health || exit 1
      * Interval: 30 seconds
      * Timeout: 5 seconds
      * Retries: 3
    - Logging:
      * Driver: awslogs
      * Group: /aws/ecs/wpp-mcp-server
      * Stream: wpp-mcp/{taskId}

  Desired Count: 3
  Launch Type: FARGATE
  Platform Version: LATEST

  Deployment:
    - Type: Rolling update
    - Minimum Healthy: 100%
    - Maximum Healthy: 200%
    - Circuit Breaker: Enabled (rollback on failure)

  Auto-Scaling:
    - Min: 2 tasks
    - Max: 10 tasks
    - Target CPU: 70%
    - Target Memory: 80%
    - Scale-up: Add 1 task when CPU >70% for 3 minutes
    - Scale-down: Remove 1 task when CPU <30% for 10 minutes
```

### 3. Application Load Balancer

```
Name: wpp-mcp-alb
Scheme: Internal (private, not internet-facing)
IP Address Type: IPv4
Subnets: Private subnets (3 AZs)

Listeners:
  Port 443 (HTTPS):
    - SSL Certificate: ACM-managed (auto-renewal)
    - Security Policy: TLS 1.3 only
    - Default Action: Forward to wpp-mcp-target-group

Target Group: wpp-mcp-target-group
  - Protocol: HTTP
  - Port: 3000
  - Target Type: IP (for Fargate)
  - Health Check:
    * Path: /health
    * Interval: 30 seconds
    * Timeout: 5 seconds
    * Healthy threshold: 2
    * Unhealthy threshold: 3
  - Deregistration Delay: 30 seconds
  - Stickiness: Enabled (for rollback consistency)

Security Group: wpp-mcp-alb-sg
  - Inbound: Port 443 from API Gateway security group only
  - Outbound: Port 3000 to ECS task security group only
```

### 4. API Gateway (HTTP API)

```
Name: wpp-mcp-api
Type: HTTP API (cheaper, simpler than REST API)
Protocol: HTTPS only

Routes:
  POST /mcp/execute-tool
    - Integration: Private ALB
    - Authorizer: Lambda (wpp-mcp-authorizer)
    - Timeout: 29 seconds (API Gateway max)

  POST /mcp/confirm-operation
    - Integration: Private ALB
    - Authorizer: Lambda (wpp-mcp-authorizer)

  GET /mcp/tools/list
    - Integration: Private ALB
    - Authorizer: Lambda (wpp-mcp-authorizer)

  GET /mcp/audit-logs
    - Integration: Private ALB
    - Authorizer: Lambda (wpp-mcp-authorizer)

  GET /mcp/health
    - Integration: Private ALB
    - Authorizer: None (public health check)

CORS:
  - Allowed Origins: https://oma.wpp.com
  - Allowed Methods: GET, POST
  - Allowed Headers: Authorization, Content-Type, X-*
  - Max Age: 3600

Throttling:
  - Rate: 10,000 requests/second
  - Burst: 5,000
  - Per-client: 100 requests/second

Custom Domain:
  - Domain: mcp.wpp.com
  - Certificate: ACM (auto-renewed)
  - DNS: Route 53 A record → API Gateway
```

### 5. Lambda Authorizer

```typescript
// Function: wpp-mcp-authorizer
// Runtime: Node.js 18.x
// Memory: 256 MB
// Timeout: 5 seconds

export async function handler(event: APIGatewayAuthorizerEvent) {
  try {
    // Extract token
    const token = event.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Extract OMA API key
    const omaApiKey = event.headers?.['x-oma-api-key'];
    if (omaApiKey !== process.env.OMA_API_KEY) {
      console.log('Invalid OMA API key');
      return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Verify JWT (Cognito)
    const decodedToken = await verifyJWT(token);

    // Validate claims
    if (decodedToken.exp < Date.now() / 1000) {
      console.log('Token expired');
      return generatePolicy(decodedToken.sub, 'Deny', event.methodArn);
    }

    // Verify WPP employee
    const employeeId = decodedToken['custom:employeeId'];
    if (!employeeId || !employeeId.startsWith('WPP-')) {
      console.log('Not a WPP employee');
      return generatePolicy(decodedToken.sub, 'Deny', event.methodArn);
    }

    // Allow request with context
    return generatePolicy(decodedToken.sub, 'Allow', event.methodArn, {
      userId: decodedToken.email,
      agency: decodedToken['custom:agency'],
      role: decodedToken['custom:role'],
      employeeId: employeeId
    });

  } catch (error) {
    console.error('Authorization error:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
}

function generatePolicy(principalId: string, effect: string, resource: string, context?: any) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    },
    context // Passed to backend as event.requestContext.authorizer
  };
}
```

### 6. DynamoDB Tables

**Table 1: approved-accounts**
```
Table Name: wpp-mcp-approved-accounts
Partition Key: userId (STRING) - e.g., "john.doe@wpp.com"
Sort Key: accountKey (STRING) - e.g., "GoogleAds:1234567890"

Attributes:
- userId (PK)
- accountKey (SK)
- api (STRING) - "Google Ads" | "GSC" | "Analytics"
- accountId (STRING) - Google account ID
- accountName (STRING) - "Client A - Retail"
- clientName (STRING) - "Client A"
- approvedBy (STRING) - "manager-toronto@wpp.com"
- approvedAt (STRING) - ISO timestamp
- expiresAt (STRING) - ISO timestamp (optional)
- requestId (STRING) - Link to original request
- status (STRING) - "ACTIVE" | "EXPIRED" | "REVOKED"

Indexes:
- GSI: api-accountId-index (query all users for an account)
- GSI: expiresAt-index (find expiring access for daily cleanup)

Billing: PAY_PER_REQUEST (on-demand)
Encryption: AWS-managed keys
Point-in-Time Recovery: Enabled
```

**Table 2: audit-logs**
```
Table Name: wpp-mcp-audit-logs
Partition Key: userId (STRING)
Sort Key: timestamp (STRING) - ISO timestamp with milliseconds

Attributes:
- userId (PK)
- timestamp (SK)
- operationId (STRING) - Unique operation ID
- tool (STRING) - Tool name
- api (STRING) - Which API (GSC, Ads, Analytics)
- accountId (STRING) - Target account
- action (STRING) - "read" | "write" | "delete"
- result (STRING) - "success" | "failure" | "blocked"
- details (MAP) - Operation-specific data
- errorMessage (STRING) - If failed
- approvalId (STRING) - If approved
- snapshotId (STRING) - For rollback
- notificationsSent (LIST) - Email recipients
- financialImpact (MAP) - Budget changes

Indexes:
- GSI: operationId-index (find specific operation)
- GSI: accountId-timestamp-index (all ops on account)
- GSI: timestamp-index (global chronological view)

TTL: expirationTime (auto-delete after 2 years)
Billing: PAY_PER_REQUEST
Encryption: AWS-managed keys
```

**Table 3: operation-snapshots**
```
Table Name: wpp-mcp-snapshots
Partition Key: operationId (STRING)

Attributes:
- operationId (PK)
- userId (STRING)
- timestamp (STRING)
- tool (STRING)
- accountId (STRING)
- resourceType (STRING) - "campaign", "budget", "keyword"
- resourceId (STRING)
- previousState (MAP) - Complete state before change
- newState (MAP) - State after change
- rollbackAvailable (BOOLEAN)
- rolledBackAt (STRING) - If rollback executed
- financialReport (MAP) - If rollback calculated impact

TTL: expirationTime (auto-delete after 90 days)
Billing: PAY_PER_REQUEST
```

**Table 4: access-requests**
```
Table Name: wpp-mcp-access-requests
Partition Key: requestId (STRING)

Attributes:
- requestId (PK)
- userId (STRING)
- requestedAccounts (LIST of MAPs)
- reason (STRING)
- requestedAt (STRING)
- status (STRING) - "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
- localManager (STRING)
- globalAdmin (STRING)
- approvedBy (STRING)
- approvedAt (STRING)
- approverNote (STRING)
- expiresAt (STRING)

Indexes:
- GSI: userId-requestedAt-index (user's request history)
- GSI: status-requestedAt-index (pending requests queue)
- GSI: localManager-status-index (manager's pending approvals)

Billing: PAY_PER_REQUEST
```

---

## SECURITY ARCHITECTURE

### Layer 1: Network Security

**VPC Flow:**
```
Internet Request
    ↓
CloudFront (public)
    ↓
AWS WAF (filters malicious traffic)
    ↓
API Gateway (AWS managed, public endpoint but restricted by WAF)
    ↓
Private Link / VPC Link
    ↓
Application Load Balancer (PRIVATE - no public IP)
    ↓
ECS Tasks in Private Subnets (PRIVATE - no public IP)
    ↓
NAT Gateway (for outbound to Google APIs)
    ↓
Internet (Google APIs)
```

**Security Groups (Firewall Rules):**
```
SG-1: API Gateway → ALB
  Inbound: None (API Gateway is managed service)
  Outbound: HTTPS (443) to ALB security group only

SG-2: ALB
  Inbound: HTTPS (443) from VPC CIDR only
  Outbound: HTTP (3000) to ECS task security group only

SG-3: ECS Tasks (MCP Servers)
  Inbound: HTTP (3000) from ALB security group only
  Outbound:
    - HTTPS (443) to internet (for Google APIs) via NAT
    - HTTPS (443) to DynamoDB VPC endpoint
    - HTTPS (443) to Secrets Manager VPC endpoint

SG-4: DynamoDB VPC Endpoint
  Inbound: HTTPS (443) from ECS task security group only

No other traffic allowed - default deny all
```

**Network ACLs (Additional Layer):**
```
- Allow inbound: Only from CloudFront IP ranges
- Allow outbound: Only to Google API IP ranges + AWS services
- Deny all other traffic
```

### Layer 2: IAM (Identity & Access Management)

**ECS Task Execution Role:**
```
Purpose: Allows ECS to set up containers
Permissions:
- ecr:GetAuthorizationToken
- ecr:BatchCheckLayerAvailability
- ecr:GetDownloadUrlForLayer
- ecr:BatchGetImage
- logs:CreateLogStream
- logs:PutLogEvents

Trust Policy: ecs-tasks.amazonaws.com
```

**ECS Task Role:**
```
Purpose: What MCP server can do
Permissions:
- secretsmanager:GetSecretValue (read secrets)
- dynamodb:PutItem, GetItem, Query (approved accounts, audit logs)
- ses:SendEmail (notifications)
- cloudwatch:PutMetricData (custom metrics)

Trust Policy: ecs-tasks.amazonaws.com

Conditions:
- Must be from specific VPC
- Must be during business hours (optional restriction)
- Rate-limited via resource policy
```

**Lambda Authorizer Role:**
```
Permissions:
- cognito-idp:GetUser (verify user exists)
- logs:CreateLogStream, PutLogEvents

Trust Policy: lambda.amazonaws.com
```

### Layer 3: Encryption

**At Rest:**
```
- DynamoDB: AWS-managed KMS keys (default)
- Secrets Manager: Separate KMS key (auto-rotated)
- CloudWatch Logs: KMS encryption
- ECS Task Storage: Encrypted volumes
- S3 Backups: SSE-S3 or KMS
```

**In Transit:**
```
- CloudFront → API Gateway: TLS 1.3
- API Gateway → ALB: TLS 1.2+
- ALB → ECS: HTTP (within VPC, encrypted at network layer)
- ECS → Google APIs: TLS 1.3
- ECS → DynamoDB: HTTPS (AWS managed TLS)
```

**Secrets:**
```
Google OAuth Tokens (per user):
  - Stored in: OMA database (encrypted)
  - Transmitted to MCP: HTTPS header (encrypted in transit)
  - Never logged or persisted in MCP
  - Used once per request then discarded

API Keys:
  - Stored in: AWS Secrets Manager
  - Encrypted with: KMS Customer Managed Key
  - Rotation: Every 90 days (automated)
  - Access: Only ECS task role
  - Audit: CloudTrail logs every secret access
```

### Layer 4: Web Application Firewall (WAF)

**AWS WAF Rules:**
```
Rule 1: Rate Limiting
- Max 100 requests/minute per IP
- Burst: 200 requests in 1 minute
- Action: Block for 10 minutes

Rule 2: Geographic Restriction
- Allow: WPP office locations (IP ranges)
  * North America: x.x.x.x/24
  * Europe: y.y.y.y/24
  * Asia Pacific: z.z.z.z/24
- Block: All other countries
- OR: Allow only from WPP VPN IPs

Rule 3: Common Attack Patterns
- SQL Injection: BLOCK
- XSS attempts: BLOCK
- Path traversal: BLOCK
- Invalid HTTP methods: BLOCK

Rule 4: Request Size
- Max body size: 1 MB
- Max header size: 8 KB
- Exceeding: BLOCK

Rule 5: Suspicious Patterns
- Multiple failed auth in 5 min: BLOCK IP for 1 hour
- Rapid tool calls (>10/sec): BLOCK for 5 minutes
- Unusual user agents: LOG and alert
```

### Layer 5: AWS GuardDuty (Threat Detection)

**Monitored Threats:**
```
- Compromised EC2/ECS instances
- Reconnaissance (port scanning, unusual API calls)
- Instance credential exfiltration
- Cryptocurrency mining
- Unusual outbound traffic patterns
- Known malicious IPs

Alerts go to:
- SNS topic → Email to security team
- Integration with OMA (webhook)
- PagerDuty for P0 incidents
```

---

## DEPLOYMENT PROCEDURE

### Prerequisites:

**AWS Account Setup:**
1. AWS Organization account (WPP corporate account)
2. Separate accounts for: Dev, Staging, Production (recommended)
3. IAM user with admin access (for deployment)
4. AWS CLI configured: `aws configure`
5. AWS CDK installed: `npm install -g aws-cdk`

**Secrets Ready:**
1. Google OAuth Client ID & Secret
2. Google Ads Developer Token
3. CrUX API Key
4. Generated OMA API Key (for OMA → MCP auth)
5. SMTP credentials (for email notifications)

---

### Step-by-Step Deployment:

**Phase 1: Create Base Infrastructure (Day 1)**

```bash
# 1. Create infrastructure project
mkdir wpp-mcp-infrastructure
cd wpp-mcp-infrastructure
cdk init app --language typescript

# 2. Install dependencies
npm install @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecs-patterns \
            @aws-cdk/aws-apigatewayv2 @aws-cdk/aws-apigatewayv2-integrations \
            @aws-cdk/aws-lambda @aws-cdk/aws-dynamodb \
            @aws-cdk/aws-secretsmanager @aws-cdk/aws-cloudfront \
            @aws-cdk/aws-wafv2 @aws-cdk/aws-route53

# 3. Create stack file (code provided in appendix)
# Create lib/wpp-mcp-stack.ts

# 4. Bootstrap CDK (one-time)
cdk bootstrap aws://{ACCOUNT_ID}/us-east-1

# 5. Synthesize CloudFormation template (verify)
cdk synth

# 6. Deploy infrastructure (~15-20 minutes)
cdk deploy WppMcpStack

# Output shows:
# - VPC ID
# - ECS Cluster ARN
# - ALB DNS name
# - API Gateway URL
# - DynamoDB table names
```

**Phase 2: Configure Secrets (Day 1)**

```bash
# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name wpp-mcp/google-client-id \
  --secret-string "60184572847-2knv6l327muo06kdp35km87049hagsot.apps.googleusercontent.com"

aws secretsmanager create-secret \
  --name wpp-mcp/google-client-secret \
  --secret-string "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"

aws secretsmanager create-secret \
  --name wpp-mcp/google-ads-dev-token \
  --secret-string "_rj-sEShX-fFZuMAIx3ouA"

aws secretsmanager create-secret \
  --name wpp-mcp/crux-api-key \
  --secret-string "AIzaSyChmTYxa4N8PL1SaqogPDyuhfh877LzEQ4"

# Generate OMA API key
aws secretsmanager create-secret \
  --name wpp-mcp/oma-api-key \
  --secret-string "$(openssl rand -hex 32)"

# Note the generated OMA API key - provide to OMA team
aws secretsmanager get-secret-value --secret-id wpp-mcp/oma-api-key --query SecretString --output text
```

**Phase 3: Build and Push Container (Day 1-2)**

```bash
# 1. Create Dockerfile in MCP project root
# (see Dockerfile in appendix)

# 2. Build MCP server
cd /path/to/MCP Servers
npm run build

# 3. Create ECR repository
aws ecr create-repository --repository-name wpp-mcp-server

# 4. Get ECR login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com

# 5. Build Docker image
docker build -t wpp-mcp-server:v1.0.0 .

# 6. Tag for ECR
docker tag wpp-mcp-server:v1.0.0 \
  {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:v1.0.0

docker tag wpp-mcp-server:v1.0.0 \
  {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:latest

# 7. Push to ECR
docker push {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:v1.0.0
docker push {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/wpp-mcp-server:latest
```

**Phase 4: Deploy ECS Service (Day 2)**

```bash
# ECS service should already be created by CDK
# Force new deployment with latest container

aws ecs update-service \
  --cluster wpp-mcp-cluster \
  --service wpp-mcp-service \
  --force-new-deployment

# Wait for deployment to complete
aws ecs wait services-stable \
  --cluster wpp-mcp-cluster \
  --services wpp-mcp-service

# Check running tasks
aws ecs list-tasks --cluster wpp-mcp-cluster --service-name wpp-mcp-service

# View logs
aws logs tail /aws/ecs/wpp-mcp-server --follow
```

**Phase 5: Configure CloudFront + Custom Domain (Day 2)**

```bash
# 1. Create Route 53 hosted zone (if not exists)
aws route53 create-hosted-zone --name wpp.com --caller-reference $(date +%s)

# 2. Request ACM certificate for mcp.wpp.com
aws acm request-certificate \
  --domain-name mcp.wpp.com \
  --validation-method DNS

# 3. Add DNS validation records (output from above command)

# 4. Wait for certificate validation
aws acm wait certificate-validated --certificate-arn {cert_arn}

# 5. CloudFront distribution (created by CDK)
# 6. Point mcp.wpp.com to CloudFront (Route 53 A record)

aws route53 change-resource-record-sets \
  --hosted-zone-id {zone_id} \
  --change-batch file://dns-record.json
```

**Phase 6: Test Deployment (Day 2-3)**

```bash
# 1. Health check
curl https://mcp.wpp.com/health

# Expected: {"status": "healthy", "version": "1.0.0", "tools": 31}

# 2. Test authentication (should fail without proper auth)
curl https://mcp.wpp.com/mcp/tools/list

# Expected: 401 Unauthorized

# 3. Test with proper auth (get JWT from OMA dev environment)
curl -H "Authorization: Bearer {jwt_token}" \
     -H "X-OMA-API-Key: {oma_api_key}" \
     https://mcp.wpp.com/mcp/tools/list

# Expected: {"tools": [...31 tools...]}

# 4. Test account authorization (with mock approved accounts)
# 5. Test safety limits (try >500% budget change)
# 6. Test rollback
# 7. Load testing
```

---

## MONITORING & ALERTING

### CloudWatch Alarms:

```
Alarm 1: High Error Rate
- Metric: Errors per minute
- Threshold: >10 in 5 minutes
- Action: SNS → Email + PagerDuty

Alarm 2: High Latency
- Metric: P99 response time
- Threshold: >5 seconds
- Action: SNS → Email

Alarm 3: Unhealthy Tasks
- Metric: Healthy task count
- Threshold: <2 tasks
- Action: SNS → Email + Auto-scaling trigger

Alarm 4: Failed Auth Attempts
- Metric: 401 responses
- Threshold: >100 in 1 hour
- Action: SNS → Security team alert

Alarm 5: Unauthorized Account Access
- Metric: ACCOUNT_NOT_AUTHORIZED errors
- Threshold: >10 in 1 hour
- Action: SNS → Security team + log review

Alarm 6: Budget Change Anomaly
- Metric: update_budget calls
- Threshold: >50 in 1 hour
- Action: SNS → Admin alert (possible automation gone wrong)

Alarm 7: Safety Limit Violations
- Metric: SAFETY_LIMIT_EXCEEDED errors
- Threshold: >5 in 1 hour
- Action: Log review + user education needed
```

### CloudWatch Dashboard:

```
Dashboard: wpp-mcp-production

Widgets:
1. Request Volume (last 24 hours)
2. Error Rate (%)
3. P50/P95/P99 Latency
4. Active ECS Tasks (count)
5. Top Tools Used (bar chart)
6. Operations by User (pie chart)
7. Budget Changes (timeline)
8. Safety Events (list)
9. Geographic Distribution (map)
10. Cost Explorer (daily spend)

Auto-refresh: Every 1 minute
Shared with: Ops team, management
```

---

## COST OPTIMIZATION

### Ways to Reduce Costs:

**1. Remove RDS (Use DynamoDB Only)**
- Savings: ~$100/month per environment
- Trade-off: No complex SQL queries
- **Recommended**: Start without RDS, add later if needed

**2. Use Fargate Spot (for dev/staging)**
- Savings: ~60% on Fargate costs
- Trade-off: Tasks can be interrupted
- Production: Use on-demand
- Dev/Staging: Use Spot

**3. Optimize NAT Gateway Usage**
- Current: 3 NAT Gateways (~$100/month)
- Alternative: 1 NAT Gateway shared (~$33/month)
- Trade-off: Single point of failure
- **Recommended**: Keep 3 for production, 1 for dev/staging

**4. DynamoDB On-Demand vs Provisioned**
- Low traffic (<10K ops/day): On-demand cheaper
- High traffic (>100K ops/day): Provisioned cheaper
- **Recommended**: Start on-demand, switch if needed

**5. CloudWatch Log Retention**
- Default: Retain forever
- Optimized: Retain 30 days, archive to S3
- Savings: ~$15/month

**Optimized Cost (3 Environments):**
```
Development: $120/month (1 NAT, Fargate Spot, minimal resources)
Staging: $180/month (1 NAT, Fargate Spot, moderate resources)
Production: $350/month (3 NATs, on-demand, full redundancy)

Total: ~$650/month (vs $900 unoptimized)
Savings: $250/month = $3,000/year
```

---

## DISASTER RECOVERY

### Backup Strategy:

**DynamoDB:**
- Point-in-time recovery: Enabled (last 35 days)
- On-demand backups: Daily (retained 90 days)
- Cross-region replication: Optional (adds ~30% cost)

**Secrets:**
- Automatic versioning (can restore previous values)
- Replicated across AZs automatically

**Infrastructure:**
- CDK code in Git (infrastructure as code = backup)
- Can recreate entire stack in minutes

**Data:**
- Audit logs: Streamed to S3 for long-term retention
- Snapshots: Exported to S3 daily
- Approved accounts: Backed up daily to S3

### Recovery Procedures:

**Scenario 1: Single Task Failure**
```
Detection: ECS health check fails
Action: ECS automatically replaces task (30-60 seconds)
Impact: None (other tasks handle requests)
RTO: <1 minute
```

**Scenario 2: Entire Service Down**
```
Detection: All health checks fail
Action: CloudWatch alarm → Engineer investigates
Recovery: Roll back to previous container version (5 minutes)
Impact: API unavailable during recovery
RTO: <10 minutes
```

**Scenario 3: Region Failure**
```
Detection: All AWS services in region down
Action: Fail over to backup region (if multi-region deployed)
Recovery: DNS change to backup region API Gateway
Impact: Users see latency increase, no data loss
RTO: <30 minutes (with multi-region), N/A without
```

**Scenario 4: Data Corruption**
```
Detection: Incorrect audit logs or approved accounts
Action: Restore from DynamoDB point-in-time backup
Recovery: Select timestamp before corruption, restore
Impact: Recent operations (since backup point) need to be reapplied
RTO: <1 hour
```

---

## APPENDICES

### Appendix A: Complete AWS CDK Stack Code

*Would be too long for this document - will be separate file: `infrastructure/lib/wpp-mcp-stack.ts`*

### Appendix B: Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY config/ ./config/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Run server
CMD ["node", "dist/gsc/server.js"]
```

### Appendix C: Environment Configuration

```
Development:
  - 2 ECS tasks
  - 1 NAT Gateway
  - Fargate Spot
  - Log retention: 7 days
  - No CloudFront/WAF (API Gateway only)

Staging:
  - 3 ECS tasks
  - 1 NAT Gateway
  - Fargate Spot
  - Log retention: 30 days
  - CloudFront + basic WAF

Production:
  - 3-10 ECS tasks (auto-scaling)
  - 3 NAT Gateways (multi-AZ)
  - Fargate on-demand
  - Log retention: 90 days + S3 archive
  - CloudFront + full WAF
  - GuardDuty enabled
  - Multi-region backup
```

---

## NEXT STEPS

1. **Approve Infrastructure Plan** (this document)
2. **Set up AWS account** (if not already done)
3. **Create CDK infrastructure code** (Week 5)
4. **Deploy to dev environment** (Week 5)
5. **Test thoroughly** (Week 6)
6. **Deploy to staging** (Week 7)
7. **OMA integration** (Weeks 8-10)
8. **Production deployment** (Weeks 11-13)

**Timeline: 3 months to production**
**Cost: ~$650-900/month for 3 environments**
**Supports: 1000+ WPP practitioners globally**

---

Last Updated: 2025-10-17
Status: Architecture Complete, Implementation Pending
Next: Create AWS CDK infrastructure code
