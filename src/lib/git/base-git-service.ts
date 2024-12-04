import {
  GitRepository,
  GitBranch,
  GitWebhook,
  BranchProtectionRule,
  GitUser,
  GitProviderConfig
} from './types';

export interface GitService {
  /**
   * Initialize the service with configuration
   */
  initialize(config: GitProviderConfig): Promise<void>;

  /**
   * Get the authenticated user's information
   */
  getCurrentUser(): Promise<GitUser>;

  /**
   * List repositories accessible to the authenticated user
   */
  listRepositories(): Promise<GitRepository[]>;

  /**
   * Get a specific repository by owner and name
   */
  getRepository(owner: string, name: string): Promise<GitRepository>;

  /**
   * List branches for a repository
   */
  listBranches(owner: string, repo: string): Promise<GitBranch[]>;

  /**
   * Create a webhook for a repository
   */
  createWebhook(owner: string, repo: string, webhookUrl: string, events: string[]): Promise<GitWebhook>;

  /**
   * Delete a webhook from a repository
   */
  deleteWebhook(owner: string, repo: string, webhookId: string): Promise<void>;

  /**
   * List webhooks for a repository
   */
  listWebhooks(owner: string, repo: string): Promise<GitWebhook[]>;

  /**
   * Create a branch protection rule
   */
  createBranchProtection(
    owner: string,
    repo: string,
    rule: BranchProtectionRule
  ): Promise<void>;

  /**
   * Remove a branch protection rule
   */
  removeBranchProtection(
    owner: string,
    repo: string,
    pattern: string
  ): Promise<void>;

  /**
   * Get branch protection rules for a repository
   */
  getBranchProtection(
    owner: string,
    repo: string,
    branch: string
  ): Promise<BranchProtectionRule | null>;

  /**
   * Validate webhook payload
   */
  validateWebhookPayload(payload: any, signature: string): boolean;
} 