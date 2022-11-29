import * as core from "@actions/core";
import * as github from "@actions/github";

export const getOctokitClient = () => {
  try {
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    return github.getOctokit(githubToken);
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
};
