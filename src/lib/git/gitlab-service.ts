import { Gitlab } from "@gitbeaker/rest";
import type { GitService } from "./base-git-service";
import type { GitProviderConfig } from "./types";
import crypto from "crypto";
import type {
  GitRepository,
  GitBranch,
  GitWebhook,
  BranchProtectionRule,
  GitUser,
} from "@/lib/git/types";

export class GitLabService implements GitService {
  private gitlab: InstanceType<typeof Gitlab> | null = null;
  private config: GitProviderConfig | null = null;

  async initialize(config: GitProviderConfig): Promise<void> {
    this.config = config;
    this.gitlab = new Gitlab({
      host: "https://gitlab.com",
      oauthToken: config.clientSecret,
    });
  }

  async getCurrentUser(): Promise<GitUser> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    const data = await this.gitlab.Users.current();

    return {
      id: data.id.toString(),
      login: data.username,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  }

  async listRepositories(): Promise<GitRepository[]> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    const data = await this.gitlab.Projects.all({ membership: true });

    return data.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.path_with_namespace,
      private: repo.visibility === "private",
      description: repo.description,
      defaultBranch: repo.default_branch,
      cloneUrl: repo.http_url_to_repo,
      provider: "gitlab" as const,
    }));
  }

  async getRepository(owner: string, name: string): Promise<GitRepository> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    const data = await this.gitlab.Projects.show(`${owner}/${name}`);

    return {
      id: data.id.toString(),
      name: data.name,
      fullName: data.path_with_namespace,
      private: data.visibility === "private",
      description: data.description,
      defaultBranch: data.default_branch,
      cloneUrl: data.http_url_to_repo,
      provider: "gitlab" as const,
    };
  }

  async listBranches(owner: string, repo: string): Promise<GitBranch[]> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    const data = await this.gitlab.Branches.all(`${owner}/${repo}`);

    return data.map((branch) => ({
      name: branch.name,
      commit: {
        sha: branch.commit.id,
        url: branch.commit.web_url,
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
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    // Map GitHub-style events to GitLab events
    const gitlabEvents = events.map((event) => {
      switch (event) {
        case "push":
          return "push_events";
        case "pull_request":
          return "merge_requests_events";
        default:
          return event;
      }
    });

    const data = await this.gitlab.ProjectHooks.add(
      `${owner}/${repo}`,
      webhookUrl,
      {
        push_events: gitlabEvents.includes("push_events"),
        merge_requests_events: gitlabEvents.includes("merge_requests_events"),
        token: this.config?.clientSecret,
      }
    );

    return {
      id: data.id.toString(),
      url: data.url,
      active: true,
      events: gitlabEvents,
      createdAt: data.created_at,
    };
  }

  async deleteWebhook(
    owner: string,
    repo: string,
    webhookId: string
  ): Promise<void> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    await this.gitlab.ProjectHooks.remove(
      `${owner}/${repo}`,
      parseInt(webhookId, 10)
    );
  }

  async listWebhooks(owner: string, repo: string): Promise<GitWebhook[]> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    const data = await this.gitlab.ProjectHooks.all(`${owner}/${repo}`);

    return data.map((hook) => ({
      id: hook.id.toString(),
      url: hook.url,
      active: true,
      events: Object.entries(hook)
        .filter(([key, value]) => key.endsWith("_events") && value === true)
        .map(([key]) => key),
      createdAt: hook.created_at,
    }));
  }

  async createBranchProtection(
    owner: string,
    repo: string,
    rule: BranchProtectionRule
  ): Promise<void> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    await this.gitlab.ProtectedBranches.protect(
      `${owner}/${repo}`,
      rule.pattern,
      {
        merge_access_level: rule.requirePullRequest ? 40 : 0, // 40 = maintainer
        push_access_level: 0, // 0 = no one can push directly
      }
    );
  }

  async removeBranchProtection(
    owner: string,
    repo: string,
    branch: string
  ): Promise<void> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    await this.gitlab.ProtectedBranches.unprotect(`${owner}/${repo}`, branch);
  }

  async getBranchProtection(
    owner: string,
    repo: string,
    branch: string
  ): Promise<BranchProtectionRule | null> {
    if (!this.gitlab) throw new Error("GitLab service not initialized");

    try {
      const data = await this.gitlab.ProtectedBranches.show(
        `${owner}/${repo}`,
        branch
      );

      return {
        pattern: branch,
        requirePullRequest: data.merge_access_levels[0]?.access_level === 40,
        requireStatusChecks: false, // GitLab handles this differently
        statusChecks: [],
      };
    } catch (error) {
      if (
        (error as unknown as { response: { status: number } }).response
          ?.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  async validateWebhookPayload(
    payload: string,
    signature: string
  ): Promise<boolean> {
    if (!this.config?.clientSecret)
      throw new Error("GitLab service not initialized");

    const token = this.config.clientSecret;
    const payloadStr =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac("sha256", token)
      .update(payloadStr)
      .digest("hex");

    return signature === expectedSignature;
  }
}
