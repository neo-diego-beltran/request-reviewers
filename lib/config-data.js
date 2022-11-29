import YAML from "yaml";
import * as core from "@actions/core";
import * as github from "@actions/github";

export const getConfigData = async (octokitClient) => {
  const configFile = core.getInput("config_path", { required: true });

  const { data } = await octokitClient.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: configFile,
    ref: github.context.sha,
  });

  core.info(`The repo owner is: ${github.context.repo.owner}`);
  core.info(`The repo repo is: ${github.context.repo.repo}`);
  core.info(`The repo ref is: ${github.context.sha}`);
  core.info(`The configFile is: ${configFile}`);

  const configData = Buffer.from(data.content, data.encoding).toString();

  try {
    return YAML.parse(configData);
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
};
