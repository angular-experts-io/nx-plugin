import { formatFiles, Tree } from '@nrwl/devkit';
import { moveGenerator } from '@nrwl/workspace/generators';
import * as inquirer from 'inquirer';
import { blue } from 'chalk';

import typePrompt from '../prompts/type.prompt';
import { projectPrompt } from '../prompts/project.prompt';
import { scopePrompt } from '../prompts/scopePrompt';
import validate from '../validate/generator';

import { MoveSchema } from './schema';
import {addScopeToConfigFile} from "../config/config.helper";

export default async function move(tree: Tree, schema: MoveSchema) {
  let { projectName, destination } = schema;

  if (!projectName) {
    console.log('Choose the project you want to move');
    projectName = await projectPrompt(tree);
  }

  const isApplication =
    projectName.endsWith('-app') || projectName.endsWith('-app-e2e');
  let newName = '';

  if (!destination) {
    if (isApplication) {
      const newName = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: `Enter the new name of your applicaton?`,
      });

      destination = newName.name.endsWith('-app')
        ? newName.name
        : `${newName.name}-app`;

      await addScopeToConfigFile(tree, destination);

    } else {
      const targetScope = await scopePrompt(
        tree,
        'Which scope do you want to move your project to'
      );

      const targetType = await typePrompt(
        tree,
        'Which type does your project have after the move'
      );

      destination = `${targetScope}/${targetType}/`;

      const changeName = await inquirer.prompt({
        type: 'list',
        name: 'yes',
        message: `Do you want to keep ${blue(
          name
        )} as name, or do you want to change the name?`,
        choices: [
          { name: `Keep ${name}`, value: false },
          { name: `Let me enter a new name`, value: true },
        ],
      });

      if (changeName.yes) {
        const targetName = await inquirer.prompt({
          name: 'value',
          message: 'Please enter a new name',
        });
        newName = targetName.value;
      }
      destination += newName;
    }
  }

  await moveGenerator(tree, {
    projectName,
    destination,
    updateImportPath: true,
    skipFormat: true,
  });

  /*
  if (!isApplication) {
    await updateJson(
      tree,
      `libs/${destination}/ng-package.json`,
      (projectJson) => {
        projectJson.dest = `../../../../../dist/libs/${destination}`;
        return projectJson;
      }
    );
  }
   */

  await formatFiles(tree);
  await validate(tree, { fix: true });
}
