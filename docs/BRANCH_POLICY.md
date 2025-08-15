# Branch Policy & Deployment Workflow

## 🚀 **Deployment Strategy**

### **Railway Deploys Main Only**
- **Production**: Railway automatically deploys from `main` branch
- **Branch**: All changes must go through `main` branch
- **Auto-deploy**: Enabled for `main` branch pushes

### **Change Management**
- **All changes via PR**: No direct pushes to `main`
- **CI must pass**: GitHub Actions `backend-typecheck` must succeed
- **Code review**: PRs require approval before merge

## 🔒 **Branch Protection Rules**

### **Main Branch**
- **Require PR**: All changes must be pull requests
- **Require CI**: `backend-typecheck` workflow must pass
- **Require review**: At least one approval required
- **No force push**: Protected against force pushes

### **Feature Branches**
- **Naming**: `feature/description` or `fix/description`
- **CI**: Must pass all checks before PR
- **Clean history**: Squash commits before merge

## 📋 **PR Process**

1. **Create branch** from `main`
2. **Make changes** and test locally
3. **Push branch** and create PR
4. **CI runs** automatically on PR
5. **Code review** and approval
6. **Merge to main** (squash commits)
7. **Railway auto-deploys** from `main`

## 🧪 **CI Requirements**

### **Backend Type Check**
- **Workflow**: `.github/workflows/backend-typecheck.yml`
- **Trigger**: PRs to `main` and pushes to `main`
- **Scope**: `sewago/backend/**` changes only
- **Steps**: `npm ci && npm run build`
- **Block**: PR merge if TypeScript compilation fails

### **Local Testing**
```bash
cd sewago/backend
npm ci
npm run build  # Must pass tsc -p .
```

## 🚨 **Emergency Procedures**

### **Hotfix Process**
1. **Create hotfix branch** from `main`
2. **Make minimal changes** to fix issue
3. **Test locally** and create PR
4. **Fast-track review** and merge
5. **Railway auto-deploys** hotfix

### **Rollback Process**
1. **Railway → Deployments** → Roll back to last green deploy
2. **Investigate** issue in hotfix branch
3. **Fix and redeploy** via normal PR process

---

**Policy**: Railway deploys main only; all changes via PR; CI must pass ✅
