import * as core from "@actions/core";

import { getOctokitClient } from "./lib/octokit-client.js";
import { getConfigData } from "./lib/config-data.js";
import { getReviewersToAssign } from "./lib/reviewers.js";

(async () => {
  try {
    const octokitClient = await getOctokitClient();
    const configData = await getConfigData(octokitClient);
    // const reviewersToAssign = await getReviewersToAssign(
    //   octokitClient,
    //   configData
    // );
    await getReviewersToAssign(octokitClient, configData);

    // console.log("====================================");
    // console.log(reviewersToAssign);
    // console.log("====================================");
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  }
})();
