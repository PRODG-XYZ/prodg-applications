import { ApolloClient, InMemoryCache, NormalizedCacheObject, createHttpLink } from '@apollo/client';

import { 
  GET_LINEAR_TEAMS,
  GET_LINEAR_PROJECTS,
  CREATE_LINEAR_ISSUE,
  UPDATE_LINEAR_ISSUE,
  GET_LINEAR_ISSUE,
  GET_TEAM_ISSUES,
  GET_PROJECT_ISSUES,
  CREATE_LINEAR_PROJECT,
  UPDATE_LINEAR_PROJECT,
  GET_LINEAR_PROJECT
} from './queries';

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  members: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: {
    id: string;
    name: string;
    type: string;
  };
  startDate?: string;
  targetDate?: string;
  progress: number;
  url: string;
  teams: {
    id: string;
    name: string;
    key: string;
  }[];
  cycles: {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string;
  }[];
  issues: {
    id: string;
    identifier: string;
    title: string;
    state: {
      id: string;
      name: string;
      color: string;
    };
    priority: number;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export interface LinearIssue {
  id: string;
  title: string;
  identifier: string;
  description?: string;
  state: {
    id: string;
    name: string;
    color: string;
  };
  priority: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  url: string;
}

export interface LinearIssueInput {
  title: string;
  description?: string;
  teamId: string;
  projectId?: string;
  stateId?: string;
  priorityId?: number;
  assigneeId?: string;
  labelIds?: string[];
  startDate?: string;
  dueDate?: string;
}

export interface LinearProjectInput {
  teamId: string;
  name: string;
  description?: string;
  state?: string;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
  memberIds?: string[];
}

export class LinearApiClient {
  private client: ApolloClient<NormalizedCacheObject>;
  
  constructor(accessToken: string) {
    const httpLink = createHttpLink({
      uri: 'https://api.linear.app/graphql',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'network-only',
        },
      },
    });
  }
  
  async getTeams(): Promise<LinearTeam[]> {
    const { data } = await this.client.query({
      query: GET_LINEAR_TEAMS,
    });
    
    return data.teams;
  }
  
  async getProjects(teamId: string): Promise<LinearProject[]> {
    const { data } = await this.client.query({
      query: GET_LINEAR_PROJECTS,
      variables: { teamId },
    });
    
    return data.team.projects;
  }

  async getProject(projectId: string): Promise<LinearProject> {
    const { data } = await this.client.query({
      query: GET_LINEAR_PROJECT,
      variables: { projectId },
    });
    
    return data.project;
  }

  async createProject(input: LinearProjectInput): Promise<LinearProject> {
    const { data } = await this.client.mutate({
      mutation: CREATE_LINEAR_PROJECT,
      variables: { input },
    });
    
    return data.projectCreate.project;
  }

  async updateProject(projectId: string, input: Partial<LinearProjectInput>): Promise<LinearProject> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_LINEAR_PROJECT,
      variables: { projectId, input },
    });
    
    return data.projectUpdate.project;
  }
  
  async createIssue(input: LinearIssueInput): Promise<LinearIssue> {
    const { data } = await this.client.mutate({
      mutation: CREATE_LINEAR_ISSUE,
      variables: { input },
    });
    
    return data.issueCreate.issue;
  }
  
  async updateIssue(id: string, input: Partial<LinearIssueInput>): Promise<LinearIssue> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_LINEAR_ISSUE,
      variables: { id, input },
    });
    
    return data.issueUpdate.issue;
  }
  
  async getIssue(id: string): Promise<LinearIssue> {
    const { data } = await this.client.query({
      query: GET_LINEAR_ISSUE,
      variables: { id },
    });
    
    return data.issue;
  }
  
  async getTeamIssues(teamId: string): Promise<LinearIssue[]> {
    const { data } = await this.client.query({
      query: GET_TEAM_ISSUES,
      variables: { teamId },
    });
    
    return data.team.issues.nodes;
  }
  
  async getProjectIssues(projectId: string): Promise<LinearIssue[]> {
    const { data } = await this.client.query({
      query: GET_PROJECT_ISSUES,
      variables: { projectId },
    });
    
    return data.project.issues.nodes;
  }
}

// For backward compatibility
export const LinearClient = LinearApiClient; 