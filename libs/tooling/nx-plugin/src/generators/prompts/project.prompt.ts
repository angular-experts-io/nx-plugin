import * as inquirer from 'inquirer';
import * as inquirerPrompt from 'inquirer-autocomplete-prompt';
import { getProjects, Tree } from '@nrwl/devkit';

import { contextPrompt } from './context.prompt';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

export async function projectPrompt(tree: Tree): Promise<string> {
  const context = await contextPrompt(
    tree,
    'Which context does your project belong to'
  );

  const filteredProjects = Array.from(getProjects(tree).keys()).filter(
    (project) => project.startsWith(context)
  );

  if (filteredProjects.length > 0) {
    const projectList = await inquirer.prompt({
      type: 'autocomplete',
      name: 'selectedProject',
      message: 'Choose a project',
      source: (answersSoFar, input) =>
        Promise.resolve().then(() => {
          /* istanbul ignore next */
          if (!input) {
            return filteredProjects;
          } else {
            return filteredProjects.filter((project) =>
              project?.toLowerCase()?.includes(input?.toLowerCase())
            );
          }
        }),
    });
    return projectList.selectedProject;
  } else {
    console.log(`🤷‍️ no project for context ${context} found`);
    process.exit();
  }
}
