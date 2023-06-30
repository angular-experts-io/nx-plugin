import {moveGenerator} from '@nrwl/workspace/generators';
import {formatFiles, Tree} from '@nrwl/devkit';
import {validate} from "@ax/validators";
import * as inquirer from 'inquirer';
import blue from 'chalk';

import {projectPrompt} from '../shared/prompts/project.prompt';
import {ProjectTypes} from "../shared/model/project-types";
import {scopePrompt} from '../shared/prompts/scope.prompt';
import {addScope} from "../shared/config/config.helper";
import typePrompt from '../shared/prompts/type.prompt';
import {extractName} from "../shared/utils/project";

import {MoveSchema} from './schema';

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
        message: `Enter the new name of your application?`,
      });

      destination = newName.name.endsWith('-app')
        ? newName.name
        : `${newName.name}-app`;

      await addScope(tree, destination);

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
      const name = extractName(projectName, ProjectTypes.LIBRARY);

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
      } else {
        newName = name;
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

  await formatFiles(tree);
  await validate(tree, { fix: true });
}
