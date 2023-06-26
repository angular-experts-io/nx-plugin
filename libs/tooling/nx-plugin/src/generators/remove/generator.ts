import {blue, green, red} from 'chalk';
import * as inquirer from 'inquirer';
import {formatFiles, getProjects, ProjectGraph, Tree, updateJson,} from '@nrwl/devkit';
import {removeGenerator} from '@nrwl/workspace';
import {createProjectGraphAsync} from '@nx/devkit';

import {projectPrompt} from '../prompts/project.prompt';
import validate from "../validate/generator";

import {RemoveOptions} from './schema';

export default async function remove(tree: Tree, schema: RemoveOptions): Promise<() => Promise<void>> {
  const { projectName } = schema;
  let projectToDelete;

  if (projectName) {
    if (existsProject(tree, projectName)) {
      projectToDelete = projectName;
    } else {
      console.log(
        red(
          `No project named ${projectName} found: Please choose a project from the list`
        )
      );
      projectToDelete = await projectPrompt(tree);
    }
  } else {
    projectToDelete = await projectPrompt(tree);
  }

  const graph: ProjectGraph = await createProjectGraphAsync();
  const { dependencies } = reverseDepGraph(graph);

  const affectedProjects = (
    await collectAffectedProjects(projectToDelete, dependencies)
  ).filter((p) => p !== projectToDelete);

  let deletedProjects = [];

  if (affectedProjects.length === 0) {
    await removeProject(tree, projectToDelete);
    deletedProjects = [projectToDelete];
  } else {
    console.log(red('⚠️ This project is still used by other projects!'));
    console.log(
      `To properly delete ${projectToDelete} we would additionally need to delete all of the following projects:`
    );
    console.log();
    affectedProjects.forEach((p) => console.log(blue('-> '), p));
    console.log();

    const howToProceed = await inquirer.prompt({
      type: 'list',
      message: `What would you like to do?`,
      name: 'answer',
      choices: [
        {
          name: 'I want to delete all',
          value: 'deleteAll',
        },
        {
          name: `I want to force delete ${projectToDelete}`,
          value: 'forceDelete',
        },
        {
          name: 'Abort',
          value: 'abort',
        },
      ],
    });

    switch (howToProceed.answer) {
      case 'deleteAll':
        await traverseDependencies(
          projectToDelete,
          dependencies,
          async (projectToDelete) => await removeProject(tree, projectToDelete)
        );
        deletedProjects = [projectToDelete, ...affectedProjects];
        break;
      case 'forceDelete':
        await removeProject(tree, projectToDelete);
        deletedProjects = [projectToDelete];
        break;
      case 'abort':
        console.log('Aborting the process. Goodbye 👋');
        process.exit();
        break;
    }
  }
  await formatFiles(tree);

  return async () => {
    console.log(
      green(
        '✅ Removal complete - the following projects were successfully deleted'
      )
    );
    console.log(
      green(
        '----------------------------------------------------------------------'
      )
    );
    deletedProjects.forEach((p) =>
      console.log(blue('-> '), green(p))
    );
    await validate(tree, { fix: true });
  };
}

async function collectAffectedProjects(
  projectToDelete,
  dependencies
): Promise<string[]> {
  const affectedProjects = [];
  await traverseDependencies(projectToDelete, dependencies, async (project) => {
    affectedProjects.push(project);
  });
  return affectedProjects;
}

async function traverseDependencies(
  project,
  dependencies,
  callback: (string) => Promise<void>
): Promise<void> {
  const deps = dependencies[project];

  if (deps.length > 0) {
    deps.forEach((dep) => {
      traverseDependencies(dep.target, dependencies, callback);
    });
    await callback(project);
  } else {
    await callback(project);
  }
}

async function removeProject(tree: Tree, projectToDelete: string): Promise<void> {
  await removeGenerator(tree, {
    projectName: projectToDelete,
    skipFormat: true,
    forceRemove: true,
  });

  await updateJson(tree, `package.json`, (packageJson) => {
    delete packageJson.scripts[`i18n:${projectToDelete}`];
    delete packageJson.scripts[`serve:${projectToDelete}:app`];
    delete packageJson.scripts[`serve:${projectToDelete}`];
    delete packageJson.scripts[`build:${projectToDelete}`];
    delete packageJson.scripts[`analyze:${projectToDelete}`];
    delete packageJson.scripts[`test:${projectToDelete}`];
    delete packageJson.scripts[`lint:${projectToDelete}`];
    delete packageJson.scripts[`e2e:${projectToDelete}`];
    return packageJson;
  });

  await updateJson(tree, `tsconfig.base.json`, (tsconfigJSON) => {
    delete tsconfigJSON.compilerOptions.paths[projectToDelete];
    return tsconfigJSON;
  });
}

export function reverseDepGraph(graph: ProjectGraph): ProjectGraph {
  const reverseMemo = new Map<ProjectGraph, ProjectGraph>();
  const resultFromMemo = reverseMemo.get(graph);
  if (resultFromMemo) {
    return resultFromMemo;
  }

  const result = {
    nodes: graph.nodes,
    externalNodes: graph.externalNodes,
    dependencies: {},
  } as ProjectGraph;
  Object.keys(graph.nodes).forEach((n) => (result.dependencies[n] = []));
  // we need to keep external node's reverse dependencies to trace our route back
  if (graph.externalNodes) {
    Object.keys(graph.externalNodes).forEach(
      (n) => (result.dependencies[n] = [])
    );
  }
  Object.values(graph.dependencies).forEach((byProject) => {
    byProject.forEach((dep) => {
      const dependency = result.dependencies[dep.target];
      if (dependency) {
        dependency.push({
          type: dep.type,
          source: dep.target,
          target: dep.source,
        });
      }
    });
  });
  reverseMemo.set(graph, result);
  reverseMemo.set(result, graph);
  return result;
}


function existsProject(tree: Tree, projectName: string): boolean {
  return Array.from(getProjects(tree).keys()).includes(
    projectName
  );
}
