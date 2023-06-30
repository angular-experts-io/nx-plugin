import { Tree } from '@nrwl/devkit';
import * as inquirer from 'inquirer';
import { green } from 'chalk';

import { addScope } from '../shared/config/config.helper';
import { ScopeOptions } from './schema';

export default async function remove(
  tree: Tree,
  schema: ScopeOptions
): Promise<() => Promise<void>> {
  let { scope } = schema;
  if (!scope) {
    const scopePrompt = await inquirer.prompt({
      type: 'input',
      name: 'newScope',
      message: 'Please enter the new scope',
    });
    scope = scopePrompt.newScope;
  }

  await addScope(tree, scope);

  return async () => {
    console.log(green('✅ Scope successfully added'));
    console.log(
      green(
        '----------------------------------------------------------------------'
      )
    );
  };
}
