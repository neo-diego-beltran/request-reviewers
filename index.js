import * as core from "@actions/core";

import { getOctokitClient } from "./lib/octokit-client";
import { getConfigData } from "./lib/config-data";
import { getReviewersToAssign } from "./lib/reviewers";

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
