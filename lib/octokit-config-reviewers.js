import YAML from "yaml";
import * as core from "@actions/core";
import * as github from "@actions/github";

export const getOctokitClient = () => {
  const gitHubToken = core.getInput("GITHUB_TOKEN", { required: true });

  return github.getOctokit(gitHubToken);
};

export const getConfigData = async (octokitClient) => {
  const configFile = core.getInput("config_path", { required: true });

  const { data: pullRequest } = await octokitClient.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: configFile,
    ref: github.context.sha,
  });

  core.info(`The repo owner is: ${github.context.repo.owner}`);
  core.info(`The repo repo is: ${github.context.repo.repo}`);
  core.info(`The repo ref is: ${github.context.sha}`);
  core.info(`The configFile is: ${configFile}`);

  const configData = Buffer.from(
    pullRequest.content,
    pullRequest.encoding
  ).toString();

  return YAML.parse(configData);
};

async function getLabels(octokitClient) {
  const labels = [];

  const { data: pullRequest } = await octokitClient.rest.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  });

  if (pullRequest.state == "open") {
    pullRequest.labels.map((label) => labels.push(label.name));
  }

  return labels;
}

export async function getReviewersToAssign(octokitClient, configData) {
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

  return reviewersToAssign;
}

export async function assignReviewers(octokitClient, { individuals, teams }) {
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
