import { gql } from '@apollo/client';

// Query to get all teams in a workspace
export const GET_LINEAR_TEAMS = gql`
  query GetLinearTeams {
    teams {
      id
      name
      key
      description
      members {
        id
        name
        email
      }
    }
  }
`;

// Query to get projects for a specific team
export const GET_LINEAR_PROJECTS = gql`
  query GetLinearProjects($teamId: ID!) {
    team(id: $teamId) {
      projects {
        id
        name
        description
        state {
          id
          name
          type
        }
        startDate
        targetDate
        progress
        url
        teams {
          id
          name
          key
        }
        cycles {
          id
          name
          startsAt
          endsAt
        }
        issues {
          nodes {
            id
            identifier
            title
            state {
              id
              name
              color
            }
            priority
            assignee {
              id
              name
              email
            }
          }
        }
      }
    }
  }
`;

// Query to get a specific project by ID
export const GET_LINEAR_PROJECT = gql`
  query GetLinearProject($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      description
      state {
        id
        name
        type
      }
      startDate
      targetDate
      progress
      url
      teams {
        id
        name
        key
      }
      cycles {
        id
        name
        startsAt
        endsAt
      }
      issues {
        nodes {
          id
          identifier
          title
          state {
            id
            name
            color
          }
          priority
          assignee {
            id
            name
            email
          }
        }
      }
    }
  }
`;

// Mutation to create a new project
export const CREATE_LINEAR_PROJECT = gql`
  mutation CreateLinearProject($input: ProjectCreateInput!) {
    projectCreate(input: $input) {
      success
      project {
        id
        name
        description
        state {
          id
          name
          type
        }
        startDate
        targetDate
        progress
        url
        teams {
          id
          name
          key
        }
      }
    }
  }
`;

// Mutation to update an existing project
export const UPDATE_LINEAR_PROJECT = gql`
  mutation UpdateLinearProject($projectId: ID!, $input: ProjectUpdateInput!) {
    projectUpdate(id: $projectId, input: $input) {
      success
      project {
        id
        name
        description
        state {
          id
          name
          type
        }
        startDate
        targetDate
        progress
        url
        teams {
          id
          name
          key
        }
      }
    }
  }
`;

// Mutation to create a new issue
export const CREATE_LINEAR_ISSUE = gql`
  mutation CreateLinearIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        title
        identifier
        description
        state {
          id
          name
          color
        }
        priority
        assignee {
          id
          name
          email
        }
        url
      }
    }
  }
`;

// Mutation to update an existing issue
export const UPDATE_LINEAR_ISSUE = gql`
  mutation UpdateLinearIssue($id: ID!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue {
        id
        title
        identifier
        description
        state {
          id
          name
          color
        }
        priority
        assignee {
          id
          name
          email
        }
        url
      }
    }
  }
`;

// Query to get a specific issue by ID
export const GET_LINEAR_ISSUE = gql`
  query GetLinearIssue($id: ID!) {
    issue(id: $id) {
      id
      title
      identifier
      description
      state {
        id
        name
        color
      }
      priority
      assignee {
        id
        name
        email
      }
      url
      createdAt
      updatedAt
    }
  }
`;

// Query to get all issues for a team
export const GET_TEAM_ISSUES = gql`
  query GetTeamIssues($teamId: ID!) {
    team(id: $teamId) {
      issues {
        nodes {
          id
          title
          identifier
          description
          state {
            id
            name
            color
          }
          priority
          assignee {
            id
            name
            email
          }
          url
        }
      }
    }
  }
`;

// Query to get all issues for a project
export const GET_PROJECT_ISSUES = gql`
  query GetProjectIssues($projectId: ID!) {
    project(id: $projectId) {
      issues {
        nodes {
          id
          title
          identifier
          description
          state {
            id
            name
            color
          }
          priority
          assignee {
            id
            name
            email
          }
          url
        }
      }
    }
  }
`;

// Subscription for issue updates
export const ISSUE_UPDATED_SUBSCRIPTION = gql`
  subscription IssueUpdated {
    issueUpdated {
      id
      title
      state {
        id
        name
        color
      }
      priority
      assignee {
        id
        name
        email
      }
    }
  }
`;

// Subscription for project updates
export const PROJECT_UPDATED_SUBSCRIPTION = gql`
  subscription ProjectUpdated {
    projectUpdated {
      id
      name
      description
      state {
        id
        name
        type
      }
      progress
    }
  }
`; 