// Markdown content for the legal documents shown in the footer modal.
// Each constant is rendered by <LegalModal /> via react-markdown.

export const COMPLIANCE_MD = `# Compliance

**Andromeda by Atherion Systems**
Last updated: June 2026

---

## Overview

Atherion Systems is committed to operating Andromeda in a manner that is secure, transparent, and aligned with industry-standard practices for enterprise software. This Compliance page describes the regulatory posture, security controls, infrastructure standards, and operational policies that govern the platform.

---

## Data Residency and Infrastructure

All data processed and stored by Andromeda resides within **Oracle Cloud Infrastructure (OCI)**, region \`mx-queretaro-1\`. Atherion Systems does not operate its own physical data center infrastructure. Instead, the platform leverages OCI's managed services, which operate under Oracle's own compliance certifications, including ISO/IEC 27001, SOC 1, SOC 2, and compliance with applicable data protection regulations.

Users with data residency requirements should note that all storage, compute, and database services are provisioned within the designated OCI region.

---

## Authentication and Identity

User authentication is handled exclusively through **OCI Identity and Access Management (IAM)** using the **OAuth 2.0 Authorization Code flow with PKCE**. This means:

- No passwords are stored by Andromeda directly. Credential management is delegated entirely to OCI IAM.
- **Multi-Factor Authentication (MFA)** is enforced for all user accounts without exception.
- User identity is established at first login via the \`sub\` claim provided by the OCI IAM identity token, and synchronized to the Andromeda user database.
- Sessions are managed through short-lived JWT access tokens with scoped claims, minimizing the attack surface of any compromised session.

---

## Role-Based Access Control

Andromeda enforces a strict **Role-Based Access Control (RBAC)** model across all platform surfaces, including the web application and the integrated Telegram bot interface. Access to resources, operations, and administrative functions is determined by the roles assigned to a user at the identity provider level, propagated through the token claims and enforced at the API layer.

No user can access data or functionality beyond what their assigned role explicitly permits.

---

## Security Assessments

The platform has been evaluated using the following security tools and methodologies:

- **OWASP ZAP** — automated dynamic application security testing (DAST) for vulnerability identification across web endpoints
- **Sn1per** — reconnaissance and attack surface enumeration
- **Qodana** — static code analysis for code quality and security anti-patterns
- **CORS policy enforcement** — strict origin validation on all API endpoints
- **Spring Actuator access control** — management endpoints restricted to authorized roles, not exposed publicly

Security assessments are conducted as part of the development lifecycle, and identified findings are triaged and addressed prior to deployment.

---

## CI/CD Pipeline and Deployment Integrity

Andromeda uses a fully automated CI/CD pipeline managed through **OCI DevOps**, consisting of:

- **Build pipelines** triggered automatically via GitHub webhook on merge to the main branch
- **Deployment pipelines** that push validated container images to the OKE cluster
- **Blue-Green deployment strategy** on **Oracle Kubernetes Engine (OKE)**, ensuring zero-downtime releases and the ability to roll back instantaneously in case of a defective deployment

All deployments are version-controlled, and container images are tagged and signed prior to promotion to production.

---

## Vulnerability and Patch Management

Atherion Systems maintains an internal process for tracking known vulnerabilities in third-party dependencies. Critical and high-severity findings are prioritized for remediation before the next deployment cycle. Dependency versions are reviewed periodically and updated in alignment with upstream security advisories.

---

## Audit and Logging

Platform activity, authentication events, and API interactions are logged at the infrastructure level through OCI's native logging and monitoring services. Logs are retained in accordance with OCI's default retention policies and are accessible to authorized platform administrators.

---

## Responsible Disclosure

If you discover a security vulnerability in Andromeda, we encourage responsible disclosure. Please contact the Atherion Systems security team through official channels before publishing any findings publicly, giving us a reasonable window to investigate and remediate.

---

## Contact

For compliance-related inquiries, contact the Atherion Systems team through the platform's official support channels.
`;

export const PRIVACY_MD = `# Privacy Policy

**Andromeda by Atherion Systems**
Last updated: June 2026

---

## 1. Introduction

Atherion Systems ("we," "us," or "our") operates Andromeda, an enterprise project management platform (the "Service"). This Privacy Policy describes what information we collect about you, how we use it, and the rights you have over it.

By using the Service, you agree to the practices described in this policy.

---

## 2. Information We Collect

We collect information you provide to us, information generated by your use of the Service, and limited technical information from your device.

**Account information.** When your account is created or you sign in for the first time, we receive your name, email address, and the role assigned to you by your organization's administrator. We do not store your password.

**Activity data.** We record the actions you take within the platform, such as creating or updating projects, tasks, and comments, and interactions with the Telegram bot integration. This is necessary to provide you with an accurate, real-time view of your team's work.

**Technical data.** We collect standard information about the device and connection you use to access the Service, such as browser type, operating system, and IP address. This data is used for security monitoring and to diagnose technical issues.

---

## 3. How We Use Your Information

We use the information we collect to operate and maintain the Service, to authenticate you and enforce the access permissions assigned by your administrator, to detect and investigate security incidents or misuse, and to improve the platform over time.

We do not use your information for advertising. We do not sell your data to anyone.

---

## 4. How We Share Your Information

We do not share your personal information with third parties except in the following circumstances:

**Service providers.** We use Oracle Cloud Infrastructure to host and store the platform's data. Oracle processes data on our behalf under its own data protection agreements and compliance certifications.

**Legal requirements.** We may disclose your information if required to do so by law, court order, or a lawful request from a government authority, to the extent permitted under applicable law.

**Protection of rights.** We may disclose information when we believe in good faith that it is necessary to protect the rights, property, or safety of Atherion Systems, our users, or the public.

---

## 5. Data Retention

We retain your information for as long as your account remains active or as needed to provide the Service. If your account is deactivated or the Service is discontinued, your data will be anonymized or deleted in accordance with our internal data lifecycle policy, unless a longer retention period is required by law.

---

## 6. Security

We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security. If you believe your account has been compromised, please contact us immediately.

---

## 7. Your Rights

You have the right to access the personal information we hold about you, to request that inaccurate information be corrected, and to request that your data be deleted, subject to any legal or operational requirements that may apply. To exercise any of these rights, contact us through the platform's official support channels.

---

## 8. Children's Privacy

The Service is intended for professional use by adults. We do not knowingly collect personal information from individuals under the age of 13. If we become aware that a minor's data has been submitted, we will delete it promptly.

---

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Continued use of the Service after changes take effect constitutes your acceptance of the revised policy.

---

## 10. Contact

For privacy-related questions, contact the Atherion Systems team through the platform's official support channels.
`;

export const TERMS_MD = `# Terms of Service

**Andromeda by Atherion Systems**
Last updated: June 2026

---

## 1. Acceptance

By accessing or using the Andromeda platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service. These Terms form a binding agreement between you and Atherion Systems ("we," "us," or "our").

---

## 2. The Service

Andromeda is an enterprise project management platform that allows teams to plan, track, and collaborate on projects. Access is granted by your organization's administrator and is subject to the permissions assigned to your account.

---

## 3. Your Account

You are responsible for keeping your account credentials confidential and for all activity that takes place under your account. You may not share your access with others or allow anyone else to use your account. If you suspect unauthorized use of your account, notify us immediately.

We may suspend or terminate your account if we determine that you have violated these Terms, if your account poses a security risk, or if it has been inactive for an extended period.

---

## 4. Acceptable Use

You agree to use the Service only for its intended purpose: managing projects and collaborating with your team. You must not use the Service to:

- Violate any applicable law or regulation
- Infringe the intellectual property rights or privacy of others
- Attempt to gain unauthorized access to any part of the platform or other users' accounts
- Introduce malware or code intended to disrupt, damage, or gain unauthorized access to any system
- Interfere with the performance or availability of the Service
- Attempt to reverse engineer or extract the underlying source code of the platform

We reserve the right to investigate suspected violations and take appropriate action, which may include account suspension and reporting to the relevant authorities.

---

## 5. Your Content

You retain ownership of the projects, tasks, documents, and any other content you create within the Service. By using the platform, you grant us a limited right to store and process that content solely as necessary to provide the Service to you and your team. We do not claim ownership of your content and will not use it for any purpose beyond operating the platform.

You are responsible for ensuring that your content does not violate any applicable law or the rights of any third party.

---

## 6. Intellectual Property

All software, design, branding, and documentation that make up Andromeda are owned by Atherion Systems and its contributors. You are granted a limited, non-transferable right to use the Service in accordance with these Terms. Nothing in these Terms gives you ownership of, or any rights over, the platform itself.

---

## 7. Availability

We aim to keep the Service available and reliable, but we do not guarantee uninterrupted access. Maintenance, infrastructure updates, and circumstances outside our control may result in temporary unavailability. We will make reasonable efforts to communicate planned downtime in advance.

---

## 8. Disclaimers

The Service is provided "as is" and "as available." We make no warranties, express or implied, regarding the Service's fitness for a particular purpose, reliability, or freedom from errors.

---

## 9. Limitation of Liability

To the extent permitted by applicable law, Atherion Systems shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of or inability to use the Service, including but not limited to loss of data or business interruption.

---

## 10. Indemnification

You agree to indemnify and hold harmless Atherion Systems and its contributors from any claims, losses, or costs arising from your violation of these Terms, your content, or your misuse of the Service.

---

## 11. Termination

We may suspend or terminate your access to the Service at any time, for any reason, with or without notice. Upon termination, your right to use the Service ends immediately. Provisions that by their nature survive termination will continue to apply.

---

## 12. Governing Law

These Terms are governed by the laws of the United Mexican States. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Monterrey, Nuevo León, Mexico.

---

## 13. Changes to These Terms

We may update these Terms from time to time. The date at the top of this page reflects the most recent revision. Continued use of the Service after changes take effect constitutes your acceptance of the updated Terms.

---

## 14. Entire Agreement

These Terms, together with our Privacy Policy, constitute the entire agreement between you and Atherion Systems regarding the Service and supersede any prior agreements on the same subject matter.

---

## 15. Contact

For questions about these Terms, contact the Atherion Systems team through the platform's official support channels.
`;
