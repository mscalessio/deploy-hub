import type { GitProviderConfig } from "@/lib/git/types";

export const gitConfig: Record<string, GitProviderConfig> = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
    scope: [
      "repo",
      "read:user",
      "user:email",
      "admin:repo_hook",
      "workflow",
      "security_events",
    ],
  },
  gitlab: {
    clientId: process.env.GITLAB_CLIENT_ID || "",
    clientSecret: process.env.GITLAB_CLIENT_SECRET || "",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gitlab/callback`,
    scope: [
      "api",
      "read_user",
      "read_repository",
      "write_repository",
      "read_registry",
      "write_registry",
      "read_api",
      "api_access",
    ],
  },
};
