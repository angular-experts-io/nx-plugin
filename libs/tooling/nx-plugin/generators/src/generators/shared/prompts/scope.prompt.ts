import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';

import { getScopes } from '../config/config.helper';

export async function scopePrompt(
  tree: Tree,
  message = 'Please select a scope'
): Promise<string> {
  const scopeList = await inquirer.prompt({
    type: 'list',
    name: 'selectedScope',
    message,
    choices: await getScopes(tree),
  });
  return scopeList.selectedScope;
}
