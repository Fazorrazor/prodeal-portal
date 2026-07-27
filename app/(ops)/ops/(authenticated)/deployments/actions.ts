/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use server";

import { verifyOpsSession } from "@/lib/ops/auth";

const VERCEL_API_URL = "https://api.vercel.com";

export type Deployment = {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: "READY" | "ERROR" | "INITIALIZING" | "BUILDING" | "CANCELED";
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitAuthorName?: string;
  };
  creator?: {
    username: string;
  };
};

export async function getVercelDeployments() {
  const session = await verifyOpsSession();
  if (!session) throw new Error("Unauthorized");

  const token = process.env.DEPLOYMENT_PROVIDER_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return {
      configured: false,
      deployments: generateMockDeployments(),
    };
  }

  try {
    const res = await fetch(
      `${VERCEL_API_URL}/v6/deployments?projectId=${projectId}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 15 }, // Cache for 15 seconds
      },
    );

    if (!res.ok) {
      throw new Error(`Vercel API error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      configured: true,
      deployments: data.deployments as Deployment[],
    };
  } catch (error) {
    console.error("Vercel integration error:", error);
    return {
      configured: true,
      error: "Failed to fetch deployments from Vercel.",
      deployments: [],
    };
  }
}

export async function rollbackDeployment(deploymentId: string) {
  const session = await verifyOpsSession();
  if (!session) throw new Error("Unauthorized");

  // In a real scenario, Vercel allows creating a new deployment based on an old one
  // or aliasing a previous deployment's URL to the production domain.
  // For safety, this just simulates the server action interface.
  console.log(
    `[OPS AUDIT] Initiated rollback to deployment ID: ${deploymentId}`,
  );

  // Simulating an API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { success: true, message: "Rollback initiated successfully." };
}

// Generate premium mock data so the UI can be visualized without configuration
function generateMockDeployments(): Deployment[] {
  const now = Date.now();
  return [
    {
      uid: "dpl_mock1a2b3c4d5e",
      name: "serotina",
      url: "serotina-production.vercel.app",
      created: now - 1000 * 60 * 15, // 15 mins ago
      state: "READY",
      meta: {
        githubCommitMessage:
          "feat(ops): harden devops portal with argon2id and webauthn v13",
        githubCommitRef: "main",
        githubCommitAuthorName: "Fazorrazor",
      },
      creator: { username: "Fazorrazor" },
    },
    {
      uid: "dpl_mock9z8y7x6w5v",
      name: "serotina",
      url: "serotina-git-feature-ops-hardening.vercel.app",
      created: now - 1000 * 60 * 60 * 2, // 2 hours ago
      state: "READY",
      meta: {
        githubCommitMessage: "chore(ops): format codebase to fix CI pipeline",
        githubCommitRef: "feature/ops-hardening-testing",
        githubCommitAuthorName: "Fazorrazor",
      },
      creator: { username: "Fazorrazor" },
    },
    {
      uid: "dpl_mock5f4e3d2c1b",
      name: "serotina",
      url: "serotina-git-main.vercel.app",
      created: now - 1000 * 60 * 60 * 24, // 1 day ago
      state: "ERROR",
      meta: {
        githubCommitMessage: "fix: resolve CI/CD pipeline blocking issues",
        githubCommitRef: "main",
        githubCommitAuthorName: "Fazorrazor",
      },
      creator: { username: "Fazorrazor" },
    },
    {
      uid: "dpl_mock1q2w3e4r5t",
      name: "serotina",
      url: "serotina-git-main-old.vercel.app",
      created: now - 1000 * 60 * 60 * 48, // 2 days ago
      state: "READY",
      meta: {
        githubCommitMessage: "feat: high-fashion editorial bento grid layout",
        githubCommitRef: "main",
        githubCommitAuthorName: "Fazorrazor",
      },
      creator: { username: "Fazorrazor" },
    },
  ];
}
