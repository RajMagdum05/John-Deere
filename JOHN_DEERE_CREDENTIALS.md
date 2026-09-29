# John Deere Developer API Credentials & Configuration

This document contains the developer sandbox credentials and configuration settings for integrating with the John Deere APIs.

---

## 1. Sandbox Application Details

| Parameter | Value |
| :--- | :--- |
| **Organization ID** | `9980860` |
| **Client ID (Application ID)** | `0oax6ie2cmNnBPxFP5d7` |
| **Client Secret (Application Secret)** | `lzKULo4Qxs_we0ZD3e2pPK5PM8DWv2Cap1aZ6r7uWNI0VBPd7yELsUVJ3gPBAeTM` |
| **Sandbox API Base URL** | `https://sandboxapi.deere.com` |
| **OAuth 2.0 Authorization URL** | `https://sandboxapi.deere.com/oauth/authorize` |
| **OAuth 2.0 Token URL** | `https://signin.johndeere.com/oauth2/aus78tnlaysMraFhC1t7/v1/token` |

---

## 2. Environment Configuration

These credentials are wired to `backend/.env`:

```env
DATABASE_URL=postgresql://jd_user:jd_password_2026@localhost:5432/john_deere_efficiency
JOHN_DEERE_ORG_ID=9980860
JOHN_DEERE_AUTH_URL=https://sandboxapi.deere.com/oauth/authorize
JOHN_DEERE_CLIENT_ID=0oax6ie2cmNnBPxFP5d7
JOHN_DEERE_CLIENT_SECRET=lzKULo4Qxs_we0ZD3e2pPK5PM8DWv2Cap1aZ6r7uWNI0VBPd7yELsUVJ3gPBAeTM
JOHN_DEERE_SANDBOX_URL=https://sandboxapi.deere.com
JWT_SECRET_KEY=your_super_secret_jwt_key_change_in_production
```

---

## 3. Required OAuth Scopes

- `ag1`: Read and write agronomic data (field boundaries, operations, prescriptions)
- `eq1`: Read equipment data (telemetry, CAN bus signals, machine measurements)
- `org1`: Read organization and permissions structure
- `files`: Read uploaded documentation and reports
- `offline_access`: Enable refresh tokens for background telemetry ingestion

---

## 4. Security Guidelines

> [!IMPORTANT]
> Never commit active production client secrets to public repositories. For production deployments, rotate secrets and inject them via secure secret managers (e.g. AWS Secrets Manager, Vault, or GitHub Actions Secrets).
