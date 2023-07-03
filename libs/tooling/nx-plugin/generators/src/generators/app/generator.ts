import path from 'path';
import * as fs from 'fs';
import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nx/devkit';
import {
  camelize,
  capitalize,
  classify,
  dasherize,
} from '@nx/devkit/src/utils/string-utils';
import { applicationGenerator } from '@nx/angular/generators';

import {addScope} from "@ax/tooling/nx-plugin/config";

import { AppGeneratorSchema } from './schema';

export default async function (tree: Tree, options: AppGeneratorSchema) {
  const projectName = `${dasherize(options.name)}-app`;
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectName}`;
  await applicationGenerator(tree, {
    name: projectName,
    style: 'scss',
    standalone: true,
    routing: true,
    tags: `type:app,scope:${projectName}`,
  });

  addFiles(tree, options, { projectName, projectRoot });

  const pathToApp = path.join(projectRoot, 'src', 'app');
  removeNxWelcomeComponent(tree, pathToApp);
  removeAppComponentTests(tree, pathToApp);
  await createScope(tree, projectName);

  await formatFiles(tree);

  return async () => {
    console.log(
      `\nℹ️ Scope for "${projectName}" added to ".eslintrc.json" and "libs/tooling/nx-plugin/src/generators/lib/schema.json"\n\n`
    );
    console.log(`Project: --project ${projectName}\n`);
    console.log(`Can be used to run additional commands like`);
    console.log(`eg "nx g remove --project ${projectName}"\n`);
  };
}

function addFiles(
  tree: Tree,
  options: AppGeneratorSchema,
  { projectRoot }: { projectName: string; projectRoot: string }
) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(projectRoot),
    classify,
    dasherize,
    capitalize,
    camelize,
  };
  const tplPath = path.join(__dirname, 'files');
  if (!fs.existsSync(tplPath)) {
    console.warn(`Could not find files`);
    return;
  }

  generateFiles(tree, tplPath, path.join(projectRoot, 'src'), templateOptions);
}

function removeAppComponentTests(tree: Tree, pathToApp: string) {
  tree.delete(path.join(pathToApp, 'app.component.spec.ts'));
}

function removeNxWelcomeComponent(tree: Tree, pathToApp: string) {
  tree.delete(path.join(pathToApp, 'nx-welcome.component.ts'));
  const appComponentContent = tree
    .read(path.join(pathToApp, 'app.component.ts'))
    ?.toString();

  if(appComponentContent){
    tree.write(
      path.join(pathToApp, 'app.component.ts'),
      appComponentContent
        .replace('NxWelcomeComponent,', '')
        .replace(
          "import { NxWelcomeComponent } from './nx-welcome.component';",
          ''
        )
    );
  }

  const appComponentSpecContent = tree
    .read(path.join(pathToApp, 'app.component.spec.ts'))
    ?.toString();

  if(appComponentSpecContent){
    tree.write(
      path.join(pathToApp, 'app.component.spec.ts'),
      appComponentSpecContent
        .replace('NxWelcomeComponent,', '')
        .replace(
          "import { NxWelcomeComponent } from './nx-welcome.component';",
          ''
        )
    );
  }
}

async function createScope(tree: Tree, projectName: string) {
  updateJson(tree, '.eslintrc.json', (json) => {
    json.overrides
      .find((o: any) => o.rules['@nx/enforce-module-boundaries'])
      .rules['@nx/enforce-module-boundaries'][1].depConstraints.unshift({
        sourceTag: `scope:${projectName}`,
        onlyDependOnLibsWithTags: ['scope:shared', `scope:${projectName}`],
      });
    return json;
  });
  await addScope(tree, projectName);
}
