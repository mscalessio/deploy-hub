import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Webhooks } from '@octokit/webhooks';
import {
  GitService,
  GitRepository,
  GitBranch,
  GitWebhook,
  BranchProtectionRule,
  GitUser,
  GitProviderConfig
} from './base-git-service';

export class GitHubService implements GitService {
  private octokit: Octokit | null = null;
  private webhooks: Webhooks | null = null;
  private config: GitProviderConfig | null = null;

  async initialize(config: GitProviderConfig): Promise<void> {
    this.config = config;
    
    this.octokit = new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
    });

    this.webhooks = new Webhooks({
      secret: config.clientSecret,
    });
  }

  async getCurrentUser(): Promise<GitUser> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.users.getAuthenticated();
    
    return {
      id: data.id.toString(),
      login: data.login,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  }

  async listRepositories(): Promise<GitRepository[]> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.repos.listForAuthenticatedUser();
    
    return data.map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      defaultBranch: repo.default_branch,
      cloneUrl: repo.clone_url,
      provider: 'github' as const,
    }));
  }

  async getRepository(owner: string, name: string): Promise<GitRepository> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.repos.get({
      owner,
      repo: name,
    });

    return {
      id: data.id.toString(),
      name: data.name,
      fullName: data.full_name,
      private: data.private,
      description: data.description,
      defaultBranch: data.default_branch,
      cloneUrl: data.clone_url,
      provider: 'github' as const,
    };
  }

  async listBranches(owner: string, repo: string): Promise<GitBranch[]> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.repos.listBranches({
      owner,
      repo,
    });

    return data.map(branch => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url,
      },
      protected: branch.protected,
    }));
  }

  async createWebhook(
    owner: string,
    repo: string,
    webhookUrl: string,
    events: string[]
  ): Promise<GitWebhook> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: this.config?.clientSecret,
      },
      events,
    });

    return {
      id: data.id.toString(),
      url: data.config.url,
      active: data.active,
      events: data.events,
      createdAt: data.created_at,
    };
  }

  async deleteWebhook(owner: string, repo: string, webhookId: string): Promise<void> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    await this.octokit.repos.deleteWebhook({
      owner,
      repo,
      hook_id: parseInt(webhookId, 10),
    });
  }

  async listWebhooks(owner: string, repo: string): Promise<GitWebhook[]> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    const { data } = await this.octokit.repos.listWebhooks({
      owner,
      repo,
    });

    return data.map(hook => ({
      id: hook.id.toString(),
      url: hook.config.url,
      active: hook.active,
      events: hook.events,
      createdAt: hook.created_at,
    }));
  }

  async createBranchProtection(
    owner: string,
    repo: string,
    rule: BranchProtectionRule
  ): Promise<void> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    await this.octokit.repos.updateBranchProtection({
      owner,
      repo,
      branch: rule.pattern,
      required_status_checks: rule.requireStatusChecks
        ? {
            strict: true,
            contexts: rule.statusChecks || [],
          }
        : null,
      enforce_admins: true,
      required_pull_request_reviews: rule.requirePullRequest
        ? {
            required_approving_review_count: rule.requiredReviewCount || 1,
          }
        : null,
      restrictions: null,
    });
  }

  async removeBranchProtection(
    owner: string,
    repo: string,
    branch: string
  ): Promise<void> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    await this.octokit.repos.deleteBranchProtection({
      owner,
      repo,
      branch,
    });
  }

  async getBranchProtection(
    owner: string,
    repo: string,
    branch: string
  ): Promise<BranchProtectionRule | null> {
    if (!this.octokit) throw new Error('GitHub service not initialized');

    try {
      const { data } = await this.octokit.repos.getBranchProtection({
        owner,
        repo,
        branch,
      });

      return {
        pattern: branch,
        requirePullRequest: !!data.required_pull_request_reviews,
        requiredReviewCount:
          data.required_pull_request_reviews?.required_approving_review_count,
        requireStatusChecks: !!data.required_status_checks,
        statusChecks: data.required_status_checks?.contexts || [],
      };
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  validateWebhookPayload(payload: any, signature: string): boolean {
    if (!this.webhooks) throw new Error('GitHub service not initialized');
    return this.webhooks.verify(payload, signature);
  }
} 