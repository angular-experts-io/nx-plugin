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

import { AppGeneratorSchema } from './schema';
import {addScopeToConfigFile} from "../shared/config/config.helper";

export default async function (tree: Tree, options: AppGeneratorSchema) {
  // is this the context?
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
  // TODO this is specific to our setup, should be removed for npm lib - check with Tomas
  // updateProjectJson(tree, projectRoot);
  await addScope(tree, projectName);

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
  { projectName, projectRoot }: { projectName: string; projectRoot: string }
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

function updateProjectJson(tree: Tree, projectRoot: string) {
  updateJson(tree, `${projectRoot}/project.json`, (json) => {
    json.targets.build.options.assets = [
      {
        glob: '**/*',
        input: 'libs/shared/assets/i18n/src',
        output: 'assets/i18n',
      },
      {
        glob: '**/*',
        input: 'libs/shared/assets/images/src',
        output: 'assets/images',
      },
      ...json.targets.build.options.assets,
    ];
    json.targets.build.options.stylePreprocessorOptions = {
      includePaths: [
        'libs/shared/styles/theme/src',
        'libs/shared/styles/components/src',
      ],
    };
    json.implicitDependencies = [
      'libs/shared/assets/i18n',
      'libs/shared/assets/images',
      'libs/shared/styles/theme',
      'libs/shared/styles/components',
    ];
    return json;
  });
}

function removeAppComponentTests(tree: Tree, pathToApp: string) {
  tree.delete(path.join(pathToApp, 'app.component.spec.ts'));
}

function removeNxWelcomeComponent(tree: Tree, pathToApp: string) {
  tree.delete(path.join(pathToApp, 'nx-welcome.component.ts'));
  const appComponentContent = tree
    .read(path.join(pathToApp, 'app.component.ts'))
    .toString();
  tree.write(
    path.join(pathToApp, 'app.component.ts'),
    appComponentContent
      .replace('NxWelcomeComponent,', '')
      .replace(
        "import { NxWelcomeComponent } from './nx-welcome.component';",
        ''
      )
  );
  const appComponentSpecContent = tree
    .read(path.join(pathToApp, 'app.component.spec.ts'))
    .toString();
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

async function addScope(tree: Tree, projectName: string) {
  updateJson(tree, '.eslintrc.json', (json) => {
    json.overrides
      .find((o) => o.rules['@nx/enforce-module-boundaries'])
      .rules['@nx/enforce-module-boundaries'][1].depConstraints.unshift({
        sourceTag: `scope:${projectName}`,
        onlyDependOnLibsWithTags: ['scope:shared', `scope:${projectName}`],
      });
    return json;
  });
  await addScopeToConfigFile(tree, projectName);
}
