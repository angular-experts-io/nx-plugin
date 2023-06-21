import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';

import {getContexts} from "../config/config.helper";

export async function contextPrompt(
  tree: Tree,
  message: string
): Promise<string> {
  const contextList = await inquirer.prompt({
    type: 'list',
    name: 'selectedContext',
    message,
    choices: await getContexts(tree),
  });
  return contextList.selectedContext;
}
