import {ProjectTypes} from '../model/project-types';
import {getProjects} from "@nrwl/devkit";
import {Tree} from "@nx/devkit";

export function getProjectsWithoutTooling(tree: Tree) {
  return Array.from(getProjects(tree).keys())
    .filter(project => !project.startsWith('tooling-'));
}

export function extractName(
  projectName: string,
  applicationType: ProjectTypes
) {
  return applicationType === ProjectTypes.APP
    ? getNameSubstring(projectName, 1)
    // TODO: does this work for all cases? what about data-access?
    : getNameSubstring(projectName, 3);
}

function getNameSubstring(projectName: string, index: number) {
  return projectName.substring(
    projectName.split('-', index).join('-').length + 1
  );
}
