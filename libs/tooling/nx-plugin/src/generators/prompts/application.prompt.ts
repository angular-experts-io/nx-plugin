import * as inquirer from 'inquirer';
import * as inquirerPrompt from 'inquirer-autocomplete-prompt';
import {getProjects, Tree} from '@nrwl/devkit';
import {contextPrompt} from "./context.prompt";

inquirer.registerPrompt('autocomplete', inquirerPrompt.default);

export async function applicationPrompt(
  tree: Tree,
  context?: string
): Promise<string> {

  if (!context) {
    context = await contextPrompt(
      tree,
      'Which context does your project belong to'
    );
  }

  const filteredApplications = Array.from(getProjects(tree))
    .filter(
      ([project, config]) =>
        project.startsWith(context) &&
        !project.endsWith('e2e') &&
        config.projectType === 'application'
    )
    .map(([project]) => project.replace(`${context}-`, ''));

  if (filteredApplications.length > 0) {
    const applicationList = await inquirer.prompt({
      type: 'autocomplete',
      name: 'selectedApplication',
      message: 'Choose a application',
      source: (answersSoFar, input) =>
        Promise.resolve().then(() => {
          /* istanbul ignore next */
          if (!input) {
            return filteredApplications;
          } else {
            return filteredApplications.filter((project) =>
              project?.toLowerCase()?.includes(input?.toLowerCase())
            );
          }
        }),
    });
    return applicationList.selectedApplication;
  } else {
    console.log(`🤷‍️ no application for context ${context} found`);
    process.exit();
  }
}
