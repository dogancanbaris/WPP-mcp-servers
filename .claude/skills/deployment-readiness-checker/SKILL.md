---
name: Deployment Readiness Checker
description: Verify WPP MCP production deployment readiness - compile clean, safety complete, tests passing, docs current, no secrets in git
---

# Deployment Readiness Checker Skill

## Purpose

Run comprehensive pre-deployment verification based on DEPLOYMENT-READY-STATUS.md checklist.

## Production Readiness Checklist

### 1. Code Quality ✅
```bash
# Must pass:
npm run build
# Expected: ✅ 0 errors, 0 warnings

npm run lint
# Expected: ✅ No type errors

npm test
# Expected: ✅ All tests passing
```

### 2. Tool Inventory ✅
- [ ] Tool count matches documentation
- [ ] All tools exported correctly
- [ ] Server loads all tools (check logs)

### 3. Safety Features ✅
- [ ] 9/9 safety features implemented
- [ ] All write tools (14 current) have approval workflow
- [ ] Budget caps enforced
- [ ] Vagueness detection active
- [ ] Snapshots working
- [ ] Notifications configured (email integration pending OK if noted)

### 4. Security ✅
- [ ] No secrets in git (.env, tokens, client secrets)
- [ ] .gitignore comprehensive
- [ ] OAuth tokens stored securely
- [ ] API keys in environment variables

### 5. Documentation ✅
- [ ] README.md current
- [ ] CURRENT-STATUS.md up to date
- [ ] Tool counts accurate
- [ ] API reference docs complete

### 6. Testing ✅
- [ ] Unit tests for safety features
- [ ] Integration tests for workflows
- [ ] All tests passing
- [ ] Manual testing completed

### 7. HTTP Server ✅
- [ ] Server starts without errors
- [ ] All 7 endpoints working
- [ ] Health check responds
- [ ] OMA integration ready

### 8. Configuration ✅
- [ ] All config files present
- [ ] Safety limits configured
- [ ] Notification settings defined
- [ ] No hardcoded values

## Automated Checks

```bash
# Run all checks:

echo "1. Compilation..."
npm run build 2>&1 | grep -E "error|warning" || echo "✅ Clean build"

echo "2. Tests..."
npm test 2>&1 | tail -5

echo "3. Tool count..."
find src -name "*Tool = {" | wc -l

echo "4. Secrets check..."
git ls-files | grep -E "\.env$|token|secret" && echo "❌ SECRETS IN GIT!" || echo "✅ No secrets"

echo "5. Documentation..."
ls *.md | wc -l

echo "6. Safety features..."
ls src/shared/{approval-enforcer,snapshot-manager,vagueness-detector}.ts | wc -l
```

## Readiness Levels

### Level 1: Development Ready ✅
- Code compiles
- Basic functionality works
- Personal testing OK

### Level 2: Pilot Ready ✅
- All safety features implemented (95%+)
- HTTP server working
- Documentation complete
- 10-user pilot OK

### Level 3: Production Ready ⏳
- Level 2 + Email notifications sending
- 100% safety features complete
- Load tested
- AWS deployment ready

### Level 4: Enterprise Ready 📋
- Level 3 + Multi-user auth
- Monitoring dashboards
- Support processes
- Training materials

## Current Status Assessment

Based on project state:
- ✅ **Level 1:** Complete
- ✅ **Level 2:** Complete (95% - pending email sending)
- ⏳ **Level 3:** 95% ready (email notifications pending)
- 📋 **Level 4:** Planned

## Report Format

```markdown
# WPP MCP DEPLOYMENT READINESS REPORT

Date: {today}
Version: {version from package.json}

## ✅ READY FOR DEPLOYMENT

**Readiness Level:** Level 2 (Pilot) - 95% ready for Level 3 (Production)

### Passing Checks (11/12):
✅ Compilation clean (0 errors)
✅ Tests passing (23/23)
✅ Tool count accurate (58 tools)
✅ No secrets in git
✅ Documentation current (18 files)
✅ Safety features (9/9 implemented)
✅ HTTP server operational
✅ All write tools protected (14/14)
✅ Budget caps enforced
✅ Snapshots working
✅ OAuth authentication working

### Pending (1/12):
⏳ Email notifications sending (framework complete, AWS SES integration pending)

## RECOMMENDATION

**Ready for:** Pilot deployment (10-50 users), Controlled production testing
**Not yet ready for:** Full unsupervised production (pending email notifications)

**Timeline to full production:** 1-2 days (complete email integration)

## Next Steps

1. Integrate AWS SES for email sending
2. Test notification delivery
3. Final verification
4. Deploy to AWS (follow AWS-DEPLOYMENT-GUIDE.md)
```

## Usage

Activate when:
- "Are we ready to deploy?"
- "Check production readiness"
- "Can we go live?"
- Before AWS deployment

## References

- DEPLOYMENT-READY-STATUS.md
- PRODUCTION-READINESS.md (4-phase rollout plan)
- AWS-DEPLOYMENT-GUIDE.md

## Remember

Better to catch issues before deployment than after!
