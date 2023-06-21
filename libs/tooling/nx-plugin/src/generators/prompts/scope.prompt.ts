import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';
import { getAvailableScopeTypes } from '../model/scope-type';

export default async function scopePrompt(
  tree: Tree,
  message: string,
  context: string
) {
  const scopeList = await inquirer.prompt({
    type: 'list',
    name: 'selectedScope',
    message,
    choices: getAvailableScopeTypes(context),
  });
  return scopeList.selectedScope;
}
