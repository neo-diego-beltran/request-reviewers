import YAML from "yaml";
import * as core from "@actions/core";
import * as github from "@actions/github";

const LOCAL_CONTEXT = {
  repo: {
    owner: "",
    repo: "",
  },
  payload: {
    pull_request: {
      number: 0,
      user: {
        login: "",
      },
    },
  },
  sha: "",
};

const REQUEST_REVIEWERS = {
  octokitClient: undefined,
  context: undefined,

  gitHubToken: undefined,
  configPathInput: undefined,
  codeownersPathInput: undefined,
};

export const initAction = (env) => {
  const context = github.context.sha ? github.context : LOCAL_CONTEXT;

  REQUEST_REVIEWERS.context = context;

  REQUEST_REVIEWERS.gitHubToken = "";
  REQUEST_REVIEWERS.configPathInput = ".github/request-reviewers.yml";
  REQUEST_REVIEWERS.codeownersPathInput = ".github/CODEOWNERS";

  if (!env) {
    REQUEST_REVIEWERS.gitHubToken = core.getInput("GITHUB_TOKEN", {
      required: true,
    });
    REQUEST_REVIEWERS.configPathInput = core.getInput("config_path", {
      required: true,
    });
    REQUEST_REVIEWERS.codeownersPathInput = core.getInput("codeowners_path", {
      required: false,
    });
  }

  const octokitClient = getOctokitClient();

  REQUEST_REVIEWERS.octokitClient = octokitClient;
};

const logInfo = (message) => {
  return core.info(`${message}\n`);
};

const getLabels = async () => {
  const labels = [];

  logInfo(
    `Current PR number: ${REQUEST_REVIEWERS.context.payload.pull_request.number}`
  );

  const { data: pullRequest } =
    await REQUEST_REVIEWERS.octokitClient.rest.pulls.get({
      owner: REQUEST_REVIEWERS.context.repo.owner,
      repo: REQUEST_REVIEWERS.context.repo.repo,
      pull_number: REQUEST_REVIEWERS.context.payload.pull_request.number,
    });

  if (pullRequest.state == "open") {
    pullRequest.labels.map((label) => labels.push(label.name));
  }

  logInfo(`Current PR labels: ${labels}`);

  return labels;
};

const getContent = async (contentPath) => {
  try {
    const { data } =
      await REQUEST_REVIEWERS.octokitClient.rest.repos.getContent({
        owner: REQUEST_REVIEWERS.context.repo.owner,
        repo: REQUEST_REVIEWERS.context.repo.repo,
        path: contentPath,
        ref: REQUEST_REVIEWERS.context.sha,
      });

    return Buffer.from(data.content, data.encoding).toString();
  } catch (err) {
    logInfo(
      `Could not get the content from content path ${contentPath} ERROR: ${err}`
    );

    return "";
  }
};

const getCodeOwners = async () => {
  const codeownersPathInput = REQUEST_REVIEWERS.codeownersPathInput;

  let codeownersPath = codeownersPathInput;
  if (
    typeof codeownersPathInput === "string" &&
    codeownersPathInput.trim().length === 0
  ) {
    codeownersPath = ".github/CODEOWNERS";
  }

  const codeownersString = await getContent(codeownersPath);

  return codeownersString
    .replace("*", "")
    .trim()
    .split("@")
    .reduce((previous, current) => {
      if (current) {
        previous.push(current.trim());
      }

      return previous;
    }, []);
};

export const getOctokitClient = () => {
  const gitHubToken = REQUEST_REVIEWERS.gitHubToken;

  logInfo(`Repository owner: ${REQUEST_REVIEWERS.context.repo.owner}`);
  logInfo(`Repository name: ${REQUEST_REVIEWERS.context.repo.repo}`);

  return github.getOctokit(gitHubToken);
};

export const getConfigData = async () => {
  const configFile = REQUEST_REVIEWERS.configPathInput;

  const configData = await getContent(configFile);

  return YAML.parse(configData);
};

export const getReviewersToAssign = async (configData) => {
  const author = REQUEST_REVIEWERS.context.payload.pull_request.user.login;
  const codeowners = await getCodeOwners();

  const labels = await getLabels();

  const tmpReviewersToAssign = {
    individuals: [],
    teams: [],
  };

  if (configData) {
    configData.who.filter((whoToAssign) => {
      const { label, assign } = whoToAssign;

      if (labels.includes(label)) {
        if (assign) {
          const { individuals, teams } = whoToAssign.assign;

          if (individuals) {
            tmpReviewersToAssign.individuals.push(...individuals);
          }

          if (teams) {
            tmpReviewersToAssign.teams.push(...teams);
          }
        }
      }
    });
  }

  logInfo(`Current PR author: ${author}`);
  logInfo(`Current PR CODEOWNERS: ${codeowners}`);

  const reviewersToRemove = [author, ...codeowners];

  logInfo(`Current PR reviewers To Remove: ${reviewersToRemove}`);

  const reviewersToAssign = {
    individuals:
      tmpReviewersToAssign.individuals.filter(
        (individual) => !reviewersToRemove.includes(individual)
      ) || [],
    teams: tmpReviewersToAssign.teams,
  };

  return reviewersToAssign;
};

export const assignReviewers = async ({ individuals, teams }) => {
  logInfo(`Current PR teams assignees: ${teams}`);
  logInfo(`Current PR individuals assignees: ${individuals}`);

  if (individuals.length || teams.length) {
    await REQUEST_REVIEWERS.octokitClient.rest.pulls.requestReviewers({
      owner: REQUEST_REVIEWERS.context.repo.owner,
      repo: REQUEST_REVIEWERS.context.repo.repo,
      pull_number: REQUEST_REVIEWERS.context.payload.pull_request.number,
      reviewers: individuals,
      team_reviewers: teams,
    });
  }
};
