import * as github from "@actions/github";

async function getLabels(octokitClient, pullRequestNumber) {
  const labels = [];

  if (pullRequestNumber) {
    const { status, data } = await octokitClient.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    });

    if (status == 200 && data.state != "pending") {
      data.labels.map((label) => labels.push(label.name));
    }
  }

  return labels;
}

export const getReviewersToAssign = async (octokitClient, configData) => {
  const author = github.context.payload.pull_request.user.login;

  const labels = await getLabels(
    octokitClient,
    github.context.payload.pull_request.number
  );

  console.log("current PR labels: ", labels);
  console.log("current config who: ", configData.who);

  // const reviewersToAssign = {
  //   individuals: new Set(),
  //   teams: new Set(),
  // };

  // for (const condition of configData.who) {

  // }

  // for (const condition of configData.when) {
  //   let authorSet = [];
  //   let authorIgnoreSet = [];
  //   let teamSet = [];
  //   let labelSet = [];
  //   if (condition.author) {
  //     authorSet = condition.author.nameIs || [];
  //     authorIgnoreSet = condition.author.ignore.nameIs || [];
  //     teamSet = condition.author.teamIs || [];
  //   }
  //   if (condition.label) {
  //     labelSet = condition.label.nameIs || [];
  //   }
  //   let individualIgnores = [];
  //   let teamIgnores = [];
  //   if (condition.exclude) {
  //     individualIgnores = condition.exclude.individuals || [];
  //     teamIgnores = condition.exclude.teams || [];
  //   }
  //   let individualAssignments = [];
  //   if (condition.assign.individuals) {
  //     individualAssignments =
  //       condition.assign.individuals.filter(
  //         (value) => !individualIgnores.includes(value)
  //       ) || [];
  //   }
  //   let teamAssignments = [];
  //   if (condition.assign.teams) {
  //     teamAssignments =
  //       condition.assign.teams.filter(
  //         (value) => !teamIgnores.includes(value)
  //       ) || [];
  //   }

  //   if (authorIgnoreSet.includes(author)) {
  //     continue;
  //   }
  //   console.log(labelSet);
  //   const isAuthorOfInterest = authorSet.includes(author);
  //   const isOnTeamOfInterest = await isOnTeam(octokitClient, author, teamSet);
  //   const containsLabelOfInterest =
  //     labelSet.filter((value) => labels.includes(value)).length != 0;

  //   if (isAuthorOfInterest || isOnTeamOfInterest || containsLabelOfInterest) {
  //     individualAssignments.forEach((reviewer) =>
  //       reviewerAssignments.individuals.add(reviewer)
  //     );
  //     teamAssignments.forEach((reviewer) =>
  //       reviewerAssignments.teams.add(reviewer)
  //     );
  //   }
  // }

  // reviewerAssignments.individuals = [...reviewerAssignments.individuals];
  // reviewerAssignments.teams = [...reviewerAssignments.teams];

  // console.log("Reviewer Assignments:");
  // console.log(reviewerAssignments);
  // return reviewerAssignments;
};
