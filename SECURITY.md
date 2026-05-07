# Security Policy

## Supported Versions

We release patches for security vulnerabilities. We recommend users to always use the latest version.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Latest release |

## Reporting a Vulnerability

If you discover a security vulnerability within AfriStory, please send an email to contact@afristory.com.

We appreciate your help and will try to respond as quickly as possible.

## Security Measures

### Data Protection
- All user data is encrypted in transit using HTTPS/TLS
- User passwords are hashed using Firebase Auth
- Personal information is protected by Firestore security rules

### Access Control
- Role-based access control (RBAC)
- Firebase Authentication with OAuth 2.0 (Google, Facebook)
- JWT tokens with expiration

### Content Protection
- Watermarking on chapter images
- Anti right-click protection
- Cloudinary signed uploads

### Moderation
- AI-based content filtering
- Community reporting system
- Manual moderation by team

## Security Best Practices

1. **Never share your password** - We will never ask for your password
2. **Use strong passwords** - At least 8 characters
3. **Enable 2FA** - Use Google's 2FA if available
4. **Report suspicious activity** - Contact us immediately

## Compliance

- GDPR compliant (data protection for EU users)
- Children's Online Privacy Protection Act (COPPA) compliant