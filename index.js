import * as core from "@actions/core";

import { getOctokitClient } from "./lib/octokit-client.js";
import { getConfigData } from "./lib/config-data.js";
import { getReviewersToAssign } from "./lib/reviewers.js";

(async () => {
  try {
    const octokitClient = getOctokitClient();
    const configData = await getConfigData(octokitClient);

    console.log("====================================");
    console.log(configData);
    console.log("====================================");
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
