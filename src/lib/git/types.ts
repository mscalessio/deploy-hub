export type GitProvider = 'github' | 'gitlab';

export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  cloneUrl: string;
  provider: GitProvider;
}

export interface GitBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitWebhook {
  id: string;
  url: string;
  active: boolean;
  events: string[];
  createdAt: string;
}

export interface BranchProtectionRule {
  pattern: string;
  requirePullRequest: boolean;
  requiredReviewCount?: number;
  requireStatusChecks: boolean;
  statusChecks?: string[];
}

export interface GitProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface GitUser {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
} 