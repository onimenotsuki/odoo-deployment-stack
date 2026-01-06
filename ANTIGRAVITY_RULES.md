# Odoo Deployment Stack Rules

## Global Context
This project deploys Odoo on AWS using AWS CDK with TypeScript.

## Technology Stack
- **Language**: TypeScript
- **Infrastructure**: AWS CDK (v2)
- **Linting**: ESLint with Airbnb TypeScript configuration
- **Formatting**: Prettier
- **Test Runner**: Jest
- **Version Control**: Git
- **CI/CD**: GitHub Actions

## Development Standards
- **TypeScript**: strictly type variables and return values. Avoid `any`.
- **Linting**: Ensure code passes `npm run lint` (ESLint) and `npm run format` (Prettier).
- **CDK**: Use `npx cdk synth` to verify infrastructure changes.

## Commit Standards
- Follow **Conventional Commits**.
- Format: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`.
- **Example**: `feat(infra): add security group rules for odoo`
- Commits are verified by `commitlint` and `husky`.

## Infrastructure & CI/CD
- **Compute**: Odoo runs on EC2 (Amazon Linux 2023).
- **Database**: PostgreSQL installed locally on EC2 (for this stack).
- **Credentials**: Pass database passwords via GitHub Secrets (`ODOO_DB_PASSWORD`, `ODOO_ADMIN_PASSWORD`) which are injected as CloudFormation parameters. never hardcode credentials.
- **Workflow**: Deployments are managed by `.github/workflows/ci-cd.yml`.
