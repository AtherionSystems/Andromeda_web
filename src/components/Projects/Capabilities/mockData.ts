import type { Capability, Task } from "./types";

// UI-only seed data. Replace these with API calls when wiring the backend.

export const SEED_CAPABILITIES: Capability[] = [
  {
    id: "cap-cloud",
    name: "Cloud Infrastructure Management",
    status: "ON TRACK",
    features: [
      {
        id: "feat-autoscale",
        name: "Auto-scaling Logic (Compute Clusters)",
        priority: "HIGH",
        status: "IN PROGRESS",
        stories: [
          {
            id: "AS-201",
            text: "As a DevOps Lead, I want to define threshold triggers for horizontal pod autoscaling based on memory pressure.",
            assignee: { initials: "DL", color: "#6b5bd2" },
          },
          {
            id: "AS-202",
            text: "Implement cool-down periods to prevent cluster flapping during peak oscillations.",
            assignee: { initials: "RK", color: "#2a6a5a" },
          },
        ],
      },
      {
        id: "feat-backup",
        name: "Multi-region Backup Automation",
        priority: "LOW",
        status: "BACKLOG",
        stories: [],
      },
    ],
  },
  {
    id: "cap-iam",
    name: "Identity & Access Governance",
    status: "PLANNING",
    features: [
      {
        id: "feat-rbac",
        name: "Role-Based Access Control",
        priority: "MEDIUM",
        status: "REVIEW",
        stories: [
          {
            id: "IA-101",
            text: "As an admin, I want to scope permissions per project so that members only see what they own.",
            assignee: { initials: "MA", color: "#c74634" },
          },
        ],
      },
      {
        id: "feat-sso",
        name: "SSO Integration (SAML)",
        priority: "HIGH",
        status: "BACKLOG",
        stories: [],
      },
    ],
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: "TSK-01",
    title: "Update onboarding documentation for new hires",
    priority: "MEDIUM",
    status: "IN PROGRESS",
    assignee: { initials: "JS", color: "#2a4a7a" },
  },
  {
    id: "TSK-02",
    title: "Fix flaky integration test in the CI pipeline",
    priority: "HIGH",
    status: "REVIEW",
    assignee: { initials: "AM", color: "#c74634" },
  },
  {
    id: "TSK-03",
    title: "Rotate expiring API credentials before end of month",
    priority: "LOW",
    status: "BACKLOG",
    assignee: { initials: "RK", color: "#2a6a5a" },
  },
];
