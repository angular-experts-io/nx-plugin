import chalk from 'chalk';
import * as path from 'path';
import { formatFiles, Tree, readJson, updateJson } from '@nx/devkit';

import {getScopes} from "../shared/config/config.helper";

import { ValidateGeneratorSchema } from './schema';

export interface Project {
  name: string;
  path: string;
}

export interface Result {
  violations: string[];
  fixes: string[];
}

export default async function validate(
  tree: Tree,
  schema: ValidateGeneratorSchema
) {
  const { fix } = schema;
  const projectJsonPaths = [
    ...findFiles(tree, './apps', 'project.json'),
    ...findFiles(tree, './libs', 'project.json'),
  ];
  const projects = projectJsonPaths.map((projectJsonPath) => ({
    name: readJson(tree, projectJsonPath).name,
    path: projectJsonPath,
  }));
  const relevantLibProjectNames = projects
    .map((p) => p.name)
    .filter(
      (n) =>
        !n.endsWith('-app') &&
        !n.endsWith('-e2e') &&
        !n.startsWith('shared-styles') &&
        !n.startsWith('shared-assets')
    );

  const aggregateViolations = [];
  const aggregateFixes = [];

  for (const project of projects) {
    const { violations, fixes } = await validateProjectTagsMatchProjectLocation(
      tree,
      project,
      fix
    );
    aggregateFixes.push(...fixes);
    aggregateViolations.push(...violations);
  }

  for (const project of projects) {
    const validateSelectorsViolations = await validateSelectors(tree, project);
    aggregateViolations.push(...validateSelectorsViolations);
  }

  const boundariesViolation =
    await validateEslintEnforceModuleBoundariesMatchesFolderStructure(tree);
  aggregateViolations.push(...boundariesViolation);

  const tsconfigBaseJsonViolations = await validateTsconfigBaseJson(
    tree,
    relevantLibProjectNames
  );
  aggregateViolations.push(...tsconfigBaseJsonViolations);
  aggregateViolations.push(...boundariesViolation);

  if (aggregateFixes.filter(Boolean)?.length > 0) {
    console.info(chalk.green.bold(aggregateFixes.join('\n\n'), '\n\n'));
    await formatFiles(tree);
  }
  return () => {
    if (aggregateViolations.filter(Boolean)?.length > 0) {
      if (aggregateFixes.filter(Boolean)?.length > 0) {
        console.log('\n');
      }
      console.error(chalk.red.bold(aggregateViolations.join('\n\n'), '\n\n'));
      throw new Error('Module boundaries validation failed');
    }
  };
}

async function validateSelectors(tree: Tree, project: Project) {
  if (project.path.startsWith('apps') || project.path.includes('tooling')) {
    return [];
  }

  const incorrectSelectors = [];
  const { name: projectName, path: projectPath } = project;
  const [, scope, type, name] = projectPath.split(path.sep);
  const projectJson = await readJson(tree, projectPath);
  const { sourceRoot } = projectJson;
  if (!sourceRoot) {
    return [];
  }
  findFiles(
    tree,
    path.join(sourceRoot, 'lib'),
    /(component|pipe|directive)\.ts$/
  ).forEach((filePath) => {
    const fileContent = tree.read(filePath, 'utf-8');
    const selectors = Array.from(
      fileContent.matchAll(/selector:\s*'(?<selector>.*)'/g)
    ).map((match) => match.groups?.selector);
    selectors.forEach((selector) => {
      const normalizedSelector = selector.replace(/-/g, '').toLowerCase();
      const normalizedNamespace = `${scope}${type}${name}`
        .replace(/-/g, '')
        .toLowerCase();
      if (!normalizedSelector.includes(normalizedNamespace)) {
        incorrectSelectors.push({
          filePath,
          selector,
        });
      }
    });
  });

  if (incorrectSelectors.length) {
    const violation = `Project ${chalk.inverse(
      projectName
    )} has components, directive or pipes with selector that doesn't match its location.

${incorrectSelectors
  .map(({ filePath, selector }) => {
    return `Selector: ${chalk.inverse(selector)}
File:     ${filePath}`;
  })
  .join('\n\n')}`;
    return [violation];
  } else {
    return [];
  }
}

async function validateProjectTagsMatchProjectLocation(
  tree: Tree,
  project: Project,
  fix = false
): Promise<Result> {
  const violations = [];
  const fixes = [];

  const { name, path: projectPath } = project;
  const [appsOrLibs, scopeOrName, type] = projectPath.split(path.sep);
  const projectJson: any = await readJson(tree, projectPath);
  const tags: string[] = projectJson?.tags ?? [];
  const expectedTags = [];
  if (appsOrLibs === 'apps') {
    if (!scopeOrName.endsWith('-e2e')) {
      expectedTags.push(`type:app`, `scope:${scopeOrName}`);
    }
  }
  if (appsOrLibs === 'libs') {
    expectedTags.push(`scope:${scopeOrName}`);
    expectedTags.push(`type:${type}`);
  }
  const tagsDiff = diff(tags, expectedTags);
  if (JSON.stringify(expectedTags.sort()) !== JSON.stringify(tags.sort())) {
    if (fix) {
      projectJson.tags = expectedTags;
      fixes.push(`${chalk.inverse(
        'FIX'
      )} Project ${name} (${appsOrLibs}) and its project.json was updated with
new tags:      ${chalk.inverse(expectedTags.join(','))}
original tags: ${tags.join(',')}`);
      updateJson(tree, `${projectPath}`, (json) => {
        json.tags = expectedTags;
        return json;
      });
    } else {
      violations.push(`Project ${name} (${appsOrLibs}) has a project.json with tags that do not match its location.
Expected:   ${expectedTags.join(', ')}
Actual:     ${tags.join(', ')}
Difference: ${chalk.inverse(tagsDiff.join(', '))}`);
    }
  }
  return {
    violations,
    fixes,
  };
}

async function validateEslintEnforceModuleBoundariesMatchesFolderStructure(
  tree: Tree
): Promise<string[]> {
  const violations = [];
  const moduleBoundaries = await getModuleBoundaries(tree);
  const relevantBoundaries = moduleBoundaries.filter((item) =>
    ['scope:'].some((prefix) => item.sourceTag.startsWith(prefix))
  );
  const scopes = Array.from(
    new Set(
      relevantBoundaries
        .filter((item) => item.sourceTag.startsWith('scope:'))
        .map((item) => item.sourceTag.split(':')[1])
    )
  ).filter((scope) => scope !== 'tooling');

  const scopesGenerator = (await getScopes(tree)).sort();
  const scopeApps = getFoldersFromTree(tree, './apps').sort();
  const scopeLibs = getFoldersFromTree(tree, './libs')
    .sort()
    .filter((s) => s !== 'tooling');
  const scopeDirs = Array.from(new Set([...scopeApps, ...scopeLibs])).filter(
    (scope) => !scope.endsWith('-e2e') && scope !== 'tooling'
  );

  const scopeFoldersDiff = diff(scopes, scopeDirs);
  if (scopeFoldersDiff.length) {
    violations.push(`Scopes (.eslintrc.json): ${scopes.join(', ')}
Folder structure:        ${scopeDirs.join(', ')}
Difference:              ${chalk.inverse(scopeFoldersDiff.join(', '))}`);
  }

  const scopeGeneratorDiff = diff(scopes, scopesGenerator);
  if (scopeGeneratorDiff.length) {
    violations.push(`Scopes (.eslintrc.json): ${scopes.join(', ')}
Scopes (lib generator):  ${scopesGenerator.join(', ')}
Difference:              ${chalk.inverse(scopeGeneratorDiff.join(', '))}`);
  }

  const folderGeneratorDiff = diff(scopeDirs, scopesGenerator);
  if (folderGeneratorDiff.length) {
    violations.push(`Scopes (lib generator):  ${scopesGenerator.join(', ')}
Folder structure:        ${scopeDirs.join(', ')}
Difference:              ${chalk.inverse(folderGeneratorDiff.join(', '))}`);
  }

  if (violations.length > 0) {
    violations.unshift(
      `Enforce module boundaries definitions in ".eslintrc.json" are out of sync with the workspace folder structure, please resolve the conflict manually by adjusting rules or removing redundant folders.`
    );
  }
  return violations;
}

async function validateTsconfigBaseJson(
  tree: Tree,
  libProjectNames: string[]
): Promise<string[]> {
  const violations = [];
  const tsconfigBaseJson = await readJson(tree, './tsconfig.base.json');
  const tsconfigBaseJsonPaths = tsconfigBaseJson?.compilerOptions?.paths ?? {};
  const tsconfigBaseJsonPathsAsProjectNames = Object.keys(
    tsconfigBaseJsonPaths
  ).map((path) => path.replace('@ax/', '').replace(/\//g, '-'));

  const tsconfigBaseJsonPathsWithoutProject = Object.keys(
    tsconfigBaseJsonPaths
  ).filter((path) => {
    const projectNameFromPath = path.replace('@ax/', '').replace(/\//g, '-');
    return !libProjectNames.includes(projectNameFromPath);
  });
  if (tsconfigBaseJsonPathsWithoutProject.length > 0) {
    violations.push(
      `The "tsconfig.base.json" file contains paths that do not match any project in the workspace: \n${chalk.inverse(
        tsconfigBaseJsonPathsWithoutProject.join('\n')
      )}\n`
    );
  }

  const projectNamesWithoutTsconfigBaseJsonPath = libProjectNames.filter(
    (projectName) => !tsconfigBaseJsonPathsAsProjectNames.includes(projectName)
  );
  if (projectNamesWithoutTsconfigBaseJsonPath.length > 0) {
    violations.push(
      `The following projects are missing a path in the "tsconfig.base.json" file: \n${chalk.inverse(
        projectNamesWithoutTsconfigBaseJsonPath.join('\n')
      )}\n`
    );
  }

  return violations;
}

async function getModuleBoundaries(tree: Tree) {
  const ENFORCE_MODULE_BOUNDARIES = '@nx/enforce-module-boundaries';
  const eslintJson = await readJson(tree, './.eslintrc.json');
  const boundaries = eslintJson?.overrides.find(
    (o) => o?.rules?.[ENFORCE_MODULE_BOUNDARIES]
  )?.rules?.[ENFORCE_MODULE_BOUNDARIES]?.[1]?.depConstraints;
  if (!boundaries) {
    throw new Error(
      `The definition for eslint rule "'@nrwl/nx/enforce-module-boundaries'" not found in the root .eslintrc.json, it should be the first item in the "overrides" array`
    );
  }
  return boundaries;
}

function getFoldersFromTree(tree: Tree, path: string) {
  const IGNORE = ['.gitkeep'];
  const folders = tree
    .children(path)
    .filter(
      (path) =>
        !IGNORE.some((ignore) => path.includes(ignore)) && !tree.isFile(path)
    );
  return folders;
}

function diff(a: any[], b: any[]) {
  return Array.from(
    new Set(
      a
        .filter((item) => !b.includes(item))
        .concat(b.filter((item) => !a.includes(item)))
    )
  );
}

function findFiles(
  tree: Tree,
  directory: string,
  fileName: string | RegExp
): string[] {
  const foundFiles: string[] = [];

  function searchFiles(dir: string) {
    const files = tree.children(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      if (tree.exists(filePath)) {
        if (tree.isFile(filePath)) {
          if (fileName instanceof RegExp) {
            if (fileName.test(filePath)) {
              foundFiles.push(filePath);
            }
          } else if (file === fileName) {
            foundFiles.push(filePath);
          }
        } else {
          searchFiles(filePath); // Recursively search subdirectories
        }
      }
    }
  }
  searchFiles(directory);
  return foundFiles;
}
