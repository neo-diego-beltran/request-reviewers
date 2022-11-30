import * as core from "@actions/core";

import {
  getOctokitClient,
  getConfigData,
  getReviewersToAssign,
  assignReviewers,
} from "./lib/octokit-config-reviewers.js";

(async () => {
  try {
    const octokitClient = getOctokitClient();
    const configData = await getConfigData(octokitClient);
    const reviewersToAssign = await getReviewersToAssign(
      octokitClient,
      configData
    );

    await assignReviewers(octokitClient, reviewersToAssign);
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
})();
