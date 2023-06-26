import {formatFiles, readJson, Tree, updateJson} from '@nrwl/devkit';
import {moveGenerator} from '@nrwl/workspace/generators';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';

import typePrompt from '../prompts/type.prompt';
import {projectPrompt} from '../prompts/project.prompt';
import {scopePrompt} from '../prompts/scopePrompt';
import {ScopeType} from '../model/scope-type';
import {ProjectTypes} from '../model/project-types';
import {extractName} from '../utils/project';
import validate from '../validate/generator';
import {applicationPrompt} from '../prompts/application.prompt';

import {MoveSchema} from './schema';

export default async function move(tree: Tree, schema: MoveSchema) {
  let {projectName, destination} = schema;

  if (!projectName) {
    console.log('Choose the project you want to move');
    projectName = await projectPrompt(tree);
  }

  const angularJSON = readJson(tree, './nx.json');
  const isApplication = angularJSON.projects[projectName]?.includes('apps');

  if (!destination) {
    let name;

    if (isApplication) {
      name = extractName(projectName, ProjectTypes.APP);
    } else {
      const targetScope = await scopePrompt(
        tree,
        'Which scope do you want to move your project to'
      );

      const targetType = await typePrompt(
        tree,
        'Which type does your project have after the move'
      );

      destination =
        targetScope === ScopeType.APP_SPECIFIC
          ? `${targetScope}/${targetType}/`
          : `${targetScope}/${targetScope}/${targetType}/`;
      name = extractName(projectName, ProjectTypes.LIBRARY);
    }

    const changeName = await inquirer.prompt({
      type: 'list',
      name: 'yes',
      message: `Do you want to keep ${chalk.blue(
        name
      )} as name, or do you want to change the name?`,
      choices: [
        {name: `Keep ${name}`, value: false},
        {name: `Let me enter a new name`, value: true},
      ],
    });

    if (changeName.yes) {
      const targetName = await inquirer.prompt({
        name: 'value',
        message: 'Please enter a new name',
      });
      name = targetName.value;
    }
    destination += name;
  }

  await moveGenerator(tree, {
    projectName,
    destination,
    updateImportPath: true,
    skipFormat: true,
  });

  if(!isApplication) {
    await updateJson(
      tree,
      `libs/${destination}/ng-package.json`,
      /* istanbul ignore next */
      (projectJson) => {
        projectJson.dest = `../../../../../dist/libs/${destination}`;
        return projectJson;
      }
    );
  }

  await formatFiles(tree);
  await validate(tree, {fix: true});
}
