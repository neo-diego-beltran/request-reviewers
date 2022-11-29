import YAML from "yaml";

export const getConfigData = async (octokitClient) => {
  const configFile = octokitClient.getInput("config_path", { required: true });

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
