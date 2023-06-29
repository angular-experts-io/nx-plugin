import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';

import { AVAILABLE_LIBRARY_TYPES } from '../model/library-type';

export default async function typePrompt(tree: Tree, message: string) {
  const typeList = await inquirer.prompt({
    type: 'list',
    name: 'selectedType',
    message,
    choices: AVAILABLE_LIBRARY_TYPES,
  });
  return typeList.selectedType;
}
