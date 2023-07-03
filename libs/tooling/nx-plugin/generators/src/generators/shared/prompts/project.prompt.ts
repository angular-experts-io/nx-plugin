import * as inquirer from 'inquirer';
import * as inquirerPrompt from 'inquirer-autocomplete-prompt';
import { Tree } from '@nrwl/devkit';

import { getProjectsWithoutTooling } from '../utils/project';

inquirer.registerPrompt('autocomplete', inquirerPrompt.default);

export async function projectPrompt(tree: Tree): Promise<string> {
  const projects = getProjectsWithoutTooling(tree);

  const projectList = await inquirer.prompt({
    type: 'autocomplete',
    name: 'selectedProject',
    message: 'Choose a project',
    source: (answersSoFar, input) =>
      Promise.resolve().then(() => {
        if (!input) {
          return projects;
        } else {
          return projects.filter((project) =>
            project?.toLowerCase()?.includes(input?.toLowerCase())
          );
        }
      }),
  });
  return projectList.selectedProject;
}
