# Request Reviewers

## For Developing

You need to build the new version of the action before publishing/releasing

- Install `vercel/ncc` by running this command in your terminal `npm i -g @vercel/ncc`

- Compile your index.js file `ncc build index.js --license LICENSE`

- You'll see a new `dist/index.js` file with your code and the compiled modules.

- You will also see an accompanying `dist/LICENSE` file containing all the licenses of the `node_modules` you are using.

From your terminal, commit the updates to your branch.

```shell
git add .
git commit -m "A nice commit message"
git tag -a -m "A nice Action release message" v[the next version]
git push --follow-tags
```

### Request Reviewers

This is a GitHub action for adding reviewers to your PRs. You can add teams and individuals as reviewers by Labels.

- Add action to your `.github/workflows`.
- Add config yml `.github/`.
- You need to create a Label ex. `TEAM_A`.
- In your config yml file you will need to add the `TEAM_A` label and add your teams or individuals.
- When you open a new PR you will need to add the `TEAM_A` label to add the reviewers.

#### Inputs

| Name           | Type     | Required | Description                              |
| -------------- | -------- | -------- | ---------------------------------------- |
| `GITHUB_TOKEN` | `string` | `true`   | This is the GITHUB_TOKEN                 |
| `config_path`  | `string` | `true`   | this is where the config file is located |

#### Basic Usage Example

File path for action `.github/workflows/request-reviewers.yml`

```yml
name: 'Request Reviewers'
on: pull_request

jobs:
  add-reviews:
    runs-on: ubuntu-latest
    steps:
      - name: Request Reviewers
        uses: neo-diego-beltran/request-reviewers@v0.0.2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          config_path: ".github/request-reviewers.yml"
      secrets: inherit
```

#### Basic Config Example

File path for action `.github/request-reviewers.yml`

```yml
who:
  - label: TEAM_A_LABEL
    assign:
      teams:
        - TeamA1
      individuals:
        - ReviewerA1
        - ReviewerA2
  - label: TEAM_B_LABEL
    assign:
      teams:
        - TeamB1
      individuals:
        - ReviewerB1
        - ReviewerB2
  - label: TEAM_C_LABEL
    assign:
      individuals:
        - ReviewerC1
        - ReviewerC2
  - label: TEAM_D_LABEL
    assign:
      teams:
        - TeamD1
        - TeamD2
```
