import { GitProvider, GitProviderConfig } from './base-git-service';
import { GitHubService } from './github-service';
import { GitLabService } from './gitlab-service';

export class GitServiceFactory {
  private static instance: GitServiceFactory;
  private services: Map<GitProvider, GitHubService | GitLabService>;

  private constructor() {
    this.services = new Map();
  }

  public static getInstance(): GitServiceFactory {
    if (!GitServiceFactory.instance) {
      GitServiceFactory.instance = new GitServiceFactory();
    }
    return GitServiceFactory.instance;
  }

  public async getService(provider: GitProvider, config: GitProviderConfig) {
    let service = this.services.get(provider);

    if (!service) {
      service = provider === 'github' ? new GitHubService() : new GitLabService();
      await service.initialize(config);
      this.services.set(provider, service);
    }

    return service;
  }

  public clearService(provider: GitProvider) {
    this.services.delete(provider);
  }

  public clearAll() {
    this.services.clear();
  }
} 