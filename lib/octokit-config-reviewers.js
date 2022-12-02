import YAML from "yaml";
import * as core from "@actions/core";
import * as github from "@actions/github";

const getLabels = async (octokitClient) => {
  const labels = [];

  core.info(`Current PR number: ${github.context.payload.pull_request.number}`);

  const { data: pullRequest } = await octokitClient.rest.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  });

  if (pullRequest.state == "open") {
    pullRequest.labels.map((label) => labels.push(label.name));
  }

  core.info(`Current PR labels: ${labels}\n`);

  return labels;
};

const getContent = async (octokitClient, contentPath) => {
  const { data } = await octokitClient.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: contentPath,
    ref: github.context.sha,
  });

  return Buffer.from(data.content, data.encoding).toString();
};

const getCodeOwners = async (octokitClient) => {
  const codeownersPathInput = core.getInput("codeowners_path", {
    required: false,
  });

  let codeownersPath = codeownersPathInput;
  if (
    typeof codeownersPathInput === "string" &&
    codeownersPathInput.trim().length === 0
  ) {
    codeownersPath = ".github/CODEOWNERS";
  }

  const codeownersString = await getContent(octokitClient, codeownersPath);

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
  const gitHubToken = core.getInput("GITHUB_TOKEN", { required: true });

  core.info(`Repository owner: ${github.context.repo.owner}\n`);
  core.info(`Repository name: ${github.context.repo.repo}\n`);

  return github.getOctokit(gitHubToken);
};

export const getConfigData = async (octokitClient) => {
  const configFile = core.getInput("config_path", { required: false });

  const configData = await getContent(octokitClient, configFile);

  return YAML.parse(configData);
};

export async function getReviewersToAssign(octokitClient, configData) {
  const author = github.context.payload.pull_request.user.login;
  const codeowners = await getCodeOwners(octokitClient);

  const labels = await getLabels(octokitClient);

  const reviewersToAssign = {
    individuals: [],
    teams: [],
  };

  configData.who.filter((whoToAssign) => {
    const { label, assign } = whoToAssign;

    if (labels.includes(label)) {
      if (assign) {
        const { individuals, teams } = whoToAssign.assign;

        if (individuals) {
          reviewersToAssign.individuals.push(...individuals);
        }

        if (teams) {
          reviewersToAssign.teams.push(...teams);
        }
      }
    }
  });

  core.info(`Current PR author: ${author}\n`);
  core.info(`Current PR CODEOWNERS: ${codeowners}\n`);

  const reviewersToRemove = [author, ...codeowners];

  core.info(`Current PR reviewers To Remove: ${reviewersToRemove}\n`);

  return {
    individuals: reviewersToAssign.individuals.filter(
      (individual) => !reviewersToRemove.includes(individual)
    ),
    teams: reviewersToAssign.teams,
  };
}

export async function assignReviewers(octokitClient, { individuals, teams }) {
  core.info(`Current PR teams assignees: ${teams}\n`);
  core.info(`Current PR individuals assignees: ${individuals}\n`);

  if (individuals.length || teams.length) {
    await octokitClient.rest.pulls.requestReviewers({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      reviewers: individuals,
      team_reviewers: teams,
    });
  }
}
