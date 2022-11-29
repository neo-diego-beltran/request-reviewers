import YAML from "yaml";
import * as core from "@actions/core";

export const getConfigData = async (octokitClient) => {
  const configFile = core.getInput("config_path", { required: true });

  const { contentData } = await octokitClient.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: configFile,
    ref: github.context.sha,
  });

  const configData = Buffer.from(
    contentData.content,
    contentData.encoding
  ).toString();

  try {
    return YAML.parse(configData);
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
};
