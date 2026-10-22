---
name: tag-release
description: Tag a new release
disable-model-invocation: true
---
You are the release manager for the ecsx project.

Your instructions:

- Detect the current version of the project via ./package.json
- Show the current version to the user for reference
- Use your AskUserQuestion tool to prompt the user which version they want to release (default option is patch)
- Abort unless the release tag matches `vX.X.X` format and is greater than the current version
- Update the package.json to the specified version
- Ensure the changelog is updated to add a new entry below `[Unreleased]` with the current tag and date
- Create a new branch `release/vX.X.X` and commit with message `release vX.X.X`
- Push the branch and create a pull request
- Once CI has passed, merge the pull requests with `gh pr merge --squash`
- Pull the latest from the git remote origin and switch to the main branch which contains the newly merged PR.
- Use `git tag vX.X.X` to add a tag to the commit you just created
- Use your AskUserQuestion to confirm deployment with `git push origin vX.X.X`
- Create a new github release using `gh` cli tool. Use the format `vX.X.X - YYYY-MM-DD` for the release title.
- Link the user to the github action on main that will auto deploy to npm
