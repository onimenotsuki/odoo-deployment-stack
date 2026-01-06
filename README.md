# Odoo Deployment via AWS CDK

This project deploys Odoo 17 on an AWS EC2 instance using AWS CDK (TypeScript).

## Features
- **Infrastructure as Code**: AWS CDK (TypeScript).
- **Setup**: VPC, Security Group, EC2 Instance (t3.small), IAM Role (SSM).
- **Configuration**: User Data script installs Postgres, Python dependencies, and Odoo.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci-cd.yml`).
- **Tooling**: ESLint (Airbnb), Prettier, Husky, Commitlint.

## Prerequisites
- Node.js (v20+)
- AWS CLI configured
- AWS CDK CLI (`npm install -g aws-cdk`)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Lint & Test**
   ```bash
   npm run lint
   # npm test (if tests are added)
   ```

3. **Deploy Manually** (Optional)
   ```bash
   npx cdk deploy --parameters OdooDbPassword=mydbpass --parameters OdooAdminPassword=myadminpass
   ```

## CI/CD Setup
This project uses GitHub Actions for deployment using OIDC.

1. **AWS OIDC Provider**: Ensure you have an OIDC provider for GitHub in your AWS account.
2. **IAM Role**: Create a role trust policy allowing the GitHub repo to assume it.
3. **GitHub Secrets**: Configure the following secrets in your repository:
   - `AWS_ROLE_TO_ASSUME`: ARN of the IAM role.
   - `AWS_REGION`: Target AWS region (e.g., `us-east-1`).
   - `ODOO_DB_PASSWORD`: Secure password for the Odoo database user.
   - `ODOO_ADMIN_PASSWORD`: Secure password for the Odoo Master Password.

## Commits
This project follows Conventional Commits.
- Use `git commit -m "feat: my feature"` to verify format via commitlint.
- Configuration in `.husky/`.

## Antigravity Rules
*Placeholder: Antigravity rules content was unavailable at time of creation. Please paste them into `ANTIGRAVITY_RULES.md`.*
