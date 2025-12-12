# Security Policy

## Supported Versions

The following versions of `translation-autocomplete` are currently supported with security updates:

| Version  | Supported          | Notes                                                   |
| -------- | ------------------ | ------------------------------------------------------- |
| >= 1.0.5 | :white_check_mark: | Security patches applied                                |
| 1.0.3    | :x:                | Known vulnerabilities (axios, js-yaml, brace-expansion) |
| < 1.0.3  | :x:                | Not supported                                           |

> ⚠️ **Recommendation:** Please upgrade to version **1.0.9** or later for the latest security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Send an email to the maintainer with details of the vulnerability.
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Response Time:** You can expect an initial response within 48 hours.
- **Updates:** We will keep you informed about the progress of fixing the vulnerability.
- **Disclosure:** Once the vulnerability is fixed, we will coordinate with you on public disclosure.

### Scope

This security policy applies to:

- The `translation-autocomplete` npm package
- The source code in this repository
- Any official distributions of this package

### Out of Scope

- Third-party dependencies (please report to the respective maintainers)
- Issues that require physical access to a user's device

## Security Best Practices

When using this package:

1. **Keep Updated:** Always use the latest version to benefit from security patches.
2. **Secure API Keys:** Never commit your `.env` file or expose API keys in your code.
3. **Validate Input:** Always validate and sanitize any user input before processing.

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged (with permission) in our release notes.

---

Thank you for helping keep `translation-autocomplete` and its users safe! 🔒
