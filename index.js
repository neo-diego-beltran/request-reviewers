import * as core from "@actions/core";

import {
  initAction,
  getConfigData,
  getReviewersToAssign,
  assignReviewers,
} from "./lib/octokit-config-reviewers.js";

(async () => {
  try {
    initAction();

    const configData = await getConfigData();

    const reviewersToAssign = await getReviewersToAssign(configData);

    await assignReviewers(reviewersToAssign);
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
})();
