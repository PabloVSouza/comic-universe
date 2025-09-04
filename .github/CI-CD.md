# 🚀 CI/CD Pipeline Documentation

This document explains the automated CI/CD pipeline for Comic Universe.

## 📋 Overview

The CI/CD system provides:

- **Automatic versioning** based on branch and commit patterns
- **Multi-platform builds** (Windows, macOS, Linux)
- **Quality assurance** with testing and linting
- **Automated releases** with proper versioning
- **Dependency management** with automatic updates

## 🔄 Workflow Structure

### 1. **Auto Versioning** (`auto-version.yml`)

**Triggers:** Push to `main`, `staging`, `dev/**` branches, or PRs

**Version Strategy:**

- **Staging branch** → `X.Y.Z-alpha.TIMESTAMP` (e.g., `2.0.0-alpha.20240905001234`)
- **Main branch** → `X.Y.Z` (e.g., `2.0.1`)
- **Pull Requests** → `X.Y.Z-beta.TIMESTAMP` (e.g., `2.0.0-beta.20240905001234`)
- **Dev branches** → `X.Y.Z-dev.TIMESTAMP` (e.g., `2.0.0-dev.20240905001234`)

**Features:**

- Automatic version bumping
- Changelog generation
- Git tag creation
- Release creation with proper metadata

### 2. **Alpha Releases** (`alpha-release.yml`)

**Triggers:** Push to `staging` branch or `v*.*.*-alpha.*` tags

**Features:**

- Multi-platform builds (Windows, macOS, Linux x64/ARM64)
- Prerelease flag enabled
- Automatic asset upload

### 3. **Stable Releases** (`release.yml`)

**Triggers:** Push to `main` branch or `v*.*.*` tags

**Features:**

- Multi-platform builds
- Stable release (no prerelease flag)
- Production-ready builds

### 4. **Beta Releases** (`beta-release.yml`)

**Triggers:** Pull requests to `main` or `staging`

**Features:**

- Automatic beta version generation
- PR comments with download links
- Testing-focused releases

### 5. **Continuous Integration** (`ci.yml`)

**Triggers:** Push/PR to any branch

**Features:**

- TypeScript compilation
- Linting and formatting checks
- Security audits
- Multi-platform build testing

### 6. **Dependency Updates** (`dependency-update.yml`)

**Triggers:** Weekly schedule (Mondays) or manual dispatch

**Features:**

- Automatic dependency updates
- Security vulnerability checks
- Automated PR creation for updates

## 🏷️ Versioning Strategy

### Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][.BUILD]
```

### Examples

- **Stable:** `2.0.1`
- **Alpha:** `2.0.1-alpha.20240905001234`
- **Beta:** `2.0.1-beta.20240905001234`
- **Dev:** `2.0.1-dev.20240905001234`

### Branch Strategy

```
main (1.0.x stable releases)
├── staging (2.0.0 alpha releases)
├── dev/v2.0.0 (2.0.0 development - main dev branch)
├── dev/feature-name (dev releases)
└── feature branches (beta releases via PR)
```

## 🚀 Release Process

### 1. **Development Workflow**

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to trigger beta release
git push origin feature/new-feature

# Create PR to staging for alpha testing
# Create PR to main for stable release
```

### 2. **Alpha Release (Staging)**

```bash
# Merge to staging branch
git checkout staging
git merge feature/new-feature
git push origin staging

# Automatic alpha release created
# Version: 2.0.1-alpha.20240905001234
```

### 3. **Stable Release (Main)**

```bash
# Merge to main branch
git checkout main
git merge staging
git push origin main

# Automatic stable release created
# Version: 2.0.1
```

## 🔧 Configuration

### Required Secrets

- `GITHUB_TOKEN` - Automatically provided
- `ACCESS_TOKEN` - For release operations (if needed)

### Environment Variables

- `NODE_VERSION=20` - Node.js version for builds
- `ELECTRON_VERSION` - Electron version (from package.json)

## 📊 Monitoring

### Release Status

- Check [Actions tab](https://github.com/pablovsouza/comic-universe/actions) for workflow status
- View [Releases page](https://github.com/pablovsouza/comic-universe/releases) for all releases

### Quality Gates

- ✅ TypeScript compilation
- ✅ Linting passes
- ✅ Security audit passes
- ✅ Build succeeds on all platforms

## 🛠️ Manual Operations

### Force Release

```bash
# Create manual tag
git tag v2.0.1
git push origin v2.0.1
```

### Dependency Updates

- Automatic: Every Monday at 9 AM UTC
- Manual: Go to Actions → "Dependency Updates" → "Run workflow"

### Beta Release for PR

- Automatically created when PR is opened/updated
- Check PR comments for download links

## 📝 Best Practices

### Commit Messages

Use conventional commits for better changelog generation:

- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates
- `refactor:` - Code refactoring

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance
- `dev/description` - Development branches

### Testing

- Always test locally before pushing
- Use PRs for code review
- Test alpha releases before promoting to stable

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in Actions

2. **Version Conflicts**
   - Ensure package.json version is correct
   - Check for duplicate tags
   - Verify branch naming conventions

3. **Release Issues**
   - Check GitHub token permissions
   - Verify release assets are generated
   - Review release configuration

### Getting Help

- Check workflow logs in GitHub Actions
- Review this documentation
- Create an issue for persistent problems

---

**Last Updated:** September 2024  
**Version:** 2.0.0
