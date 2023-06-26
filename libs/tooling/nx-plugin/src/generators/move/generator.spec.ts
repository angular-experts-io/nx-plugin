import * as nrwlWorkspaceGenerators from '@nrwl/workspace/generators';
import {createTreeWithEmptyWorkspace} from '@nrwl/devkit/testing';
import * as nrwlDevkit from '@nrwl/devkit';
import * as inquirer from 'inquirer';
import {Tree} from '@nrwl/devkit';

import * as validateModuleBoundaries from '../module-boundaries-validate/generator';
import * as applicationPrompts from '../prompts/application.prompt';
import * as generatorUtils from '../utils/generators-angular';
import * as projectPrompts from '../prompts/project.prompt';
import * as contextPrompts from '../prompts/scopePrompt';
import * as extractNameUtils from '../utils/projectname';
import * as scopePrompts from '../prompts/scope.prompt';
import * as configHelper from '../config/config.helper';
import generateWorkspaceLibrary from '../lib/generator';
import * as typePrompts from '../prompts/type.prompt';
import {ProjectTypes} from "../model/project-types";
import generateWorkspaceApp from '../app/generator';
import {LibraryType} from '../model/library-type';
import {ScopeType} from '../model/scope-type';

import move from './generator';

const mockContexts = ['foo', 'bar', 'baz'];
const mockPrefix = 'my-awesome-prefix';
const mockAppSuffix = 'app';

jest
  .spyOn(configHelper, 'createAndGetConfigFileIfNonExisting')
  .mockImplementation(() => Promise.resolve());

jest
  .spyOn(configHelper, 'getScopes')
  .mockImplementation(() => mockContexts);

jest
  .spyOn(configHelper, 'getPrefix')
  .mockImplementation(() => mockPrefix);

jest
  .spyOn(configHelper, 'getAppSuffix')
  .mockImplementation(() => mockAppSuffix);

jest.spyOn(generatorUtils, 'angularComponentGenerator');

describe('move generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace(2);
  });

  it('should call the project prompt if no projectName was provided', async () => {
    const context = 'domain-a';
    const appName = 'test';

    jest
      .spyOn(applicationPrompts, 'applicationPrompt')
      .mockReturnValue(Promise.resolve(appName));

    jest
      .spyOn(contextPrompts, 'scopePrompt')
      .mockImplementation(() => Promise.resolve(context));

    jest
      .spyOn(projectPrompts, 'projectPrompt')
      .mockImplementation(() => Promise.resolve(`${context}-${appName}-${mockAppSuffix}`));

    jest
      .spyOn(scopePrompts, 'default')
      .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

    jest
      .spyOn(typePrompts, 'default')
      .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

    jest.spyOn(inquirer, 'prompt').mockReturnValue(
      Promise.resolve({
        yes: false,
      })
    );

    jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator');

    await generateWorkspaceApp(tree, {context, name: appName});

    tree.write(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/nx/schemas/workspace-schema.json',
        version: 2,
        projects: {
          [`${context}-${appName}-${mockAppSuffix}`]: `apps/${context}/${appName}-${mockAppSuffix}`,
        },
      })
    );

    await move(tree, {});

    expect(projectPrompts.projectPrompt).toHaveBeenCalledWith(tree);
  });

  it('should ask for the target context if no destination was provided', async () => {
    const context = 'domain-a';
    const appName = 'test';

    jest
      .spyOn(applicationPrompts, 'applicationPrompt')
      .mockReturnValue(Promise.resolve(appName));

    jest
      .spyOn(contextPrompts, 'scopePrompt')
      .mockImplementation(() => Promise.resolve(context));

    jest
      .spyOn(projectPrompts, 'projectPrompt')
      .mockImplementation(() => Promise.resolve(`${context}-${appName}-${mockAppSuffix}`));

    jest
      .spyOn(scopePrompts, 'default')
      .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

    jest
      .spyOn(typePrompts, 'default')
      .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

    jest.spyOn(inquirer, 'prompt').mockReturnValue(
      Promise.resolve({
        yes: false,
      })
    );

    jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator');

    await generateWorkspaceApp(tree, {context, name: appName});

    tree.write(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/nx/schemas/workspace-schema.json',
        version: 2,
        projects: {
          [`${context}-${appName}-${mockAppSuffix}`]: `apps/${context}/${appName}-${mockAppSuffix}`,
        },
      })
    );

    await move(tree, {});

    expect(contextPrompts.scopePrompt).toHaveBeenCalled();
  });

  it('should call the moveGenerator if we want to move an application', async () => {
    const context = 'domain-a';
    const appName = 'test';
    const newAppName = 'new-test-app';

    jest
      .spyOn(applicationPrompts, 'applicationPrompt')
      .mockReturnValue(Promise.resolve(appName));

    jest
      .spyOn(contextPrompts, 'scopePrompt')
      .mockImplementation(() => Promise.resolve(context));

    jest
      .spyOn(projectPrompts, 'projectPrompt')
      .mockImplementation(() => Promise.resolve(`${context}-${appName}-${mockAppSuffix}`));

    jest
      .spyOn(scopePrompts, 'default')
      .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

    jest
      .spyOn(typePrompts, 'default')
      .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

    jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(newAppName);

    jest.spyOn(inquirer, 'prompt').mockReturnValue(
      Promise.resolve({
        yes: false,
      })
    );

    jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator');

    await generateWorkspaceApp(tree, {context, name: appName});

    tree.write(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/nx/schemas/workspace-schema.json',
        version: 2,
        projects: {
          [`${context}-${appName}-${mockAppSuffix}`]: `apps/${context}/${appName}-${mockAppSuffix}`,
        },
      })
    );

    await move(tree, {});

    expect(nrwlWorkspaceGenerators.moveGenerator).toHaveBeenCalledWith(tree, {
      projectName: `${context}-${appName}-${mockAppSuffix}`,
      destination: `${context}/${newAppName}`,
      updateImportPath: true,
      skipFormat: true,
    });
  });

  it('should format the files after moving apps', async () => {
    const context = 'domain-a';
    const appName = 'test';
    const newAppName = 'new-test-app';

    jest
      .spyOn(applicationPrompts, 'applicationPrompt')
      .mockReturnValue(Promise.resolve(appName));

    jest
      .spyOn(contextPrompts, 'scopePrompt')
      .mockImplementation(() => Promise.resolve(context));

    jest
      .spyOn(projectPrompts, 'projectPrompt')
      .mockImplementation(() => Promise.resolve(`${context}-${appName}-${mockAppSuffix}`));

    jest
      .spyOn(scopePrompts, 'default')
      .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

    jest
      .spyOn(typePrompts, 'default')
      .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

    jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(newAppName);

    jest.spyOn(inquirer, 'prompt').mockReturnValue(
      Promise.resolve({
        yes: false,
      })
    );

    jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator');

    jest.spyOn(nrwlDevkit, 'formatFiles');

    await generateWorkspaceApp(tree, {context, name: appName});

    tree.write(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/nx/schemas/workspace-schema.json',
        version: 2,
        projects: {
          [`${context}-${appName}-${mockAppSuffix}`]: `apps/${context}/${appName}-${mockAppSuffix}`,
        },
      })
    );

    await move(tree, {});
    expect(nrwlDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should validate the module boundaries after moving apps', async () => {
    const context = 'domain-a';
    const appName = 'test';
    const newAppName = 'new-test-app';

    jest
      .spyOn(applicationPrompts, 'applicationPrompt')
      .mockReturnValue(Promise.resolve(appName));

    jest
      .spyOn(contextPrompts, 'scopePrompt')
      .mockImplementation(() => Promise.resolve(context));

    jest
      .spyOn(projectPrompts, 'projectPrompt')
      .mockImplementation(() => Promise.resolve(`${context}-${appName}-${mockAppSuffix}`));

    jest.spyOn(validateModuleBoundaries, 'default');

    jest
      .spyOn(scopePrompts, 'default')
      .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

    jest
      .spyOn(typePrompts, 'default')
      .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

    jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(newAppName);

    jest.spyOn(inquirer, 'prompt').mockReturnValue(
      Promise.resolve({
        yes: false,
      })
    );

    jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator');

    jest.spyOn(nrwlDevkit, 'formatFiles');

    await generateWorkspaceApp(tree, {context, name: appName});

    tree.write(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/nx/schemas/workspace-schema.json',
        version: 2,
        projects: {
          [`${context}-${appName}-${mockAppSuffix}`]: `apps/${context}/${appName}-${mockAppSuffix}`,
        },
      })
    );

    await move(tree, {});
    expect(validateModuleBoundaries.default).toHaveBeenCalledWith(tree, {fix: true});
  });

  describe('Moving a library', () => {

    it('should call the scopePrompt if we want to move a library', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.listChanges().forEach(e => console.log(e.path));

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(scopePrompts.default).toHaveBeenCalled();
    });

    it('should call the applicationPrompt if we want to move a app specific library', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.APP_SPECIFIC));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(applicationPrompts.applicationPrompt).toHaveBeenCalled();
    });

    it('should call the typePrompt if no destination type was provided', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(typePrompts.default).toHaveBeenCalled();
    });

    it('should extract the libraries name', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(extractNameUtils.extractName).toHaveBeenCalledWith(
        `${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`, ProjectTypes.LIBRARY);
    });

    it('should call the move generator for libs', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(nrwlWorkspaceGenerators.moveGenerator).toHaveBeenCalledWith(
        tree, {
          projectName: `${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`,
          destination: `${context}/${scopeType}/${type}/${newAppName}`,
          updateImportPath: true,
          skipFormat: true,
        });
    });

    it('should update the ng-package.json for libraries', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(nrwlDevkit.updateJson).toHaveBeenCalled();
    });

    it('should format the files after we moved a library', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(nrwlDevkit, 'formatFiles');

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(nrwlDevkit.formatFiles).toHaveBeenCalledWith(tree);
    });

    it('should validate the module boundaries after we moved a library', async () => {
      const context = 'domain-a';
      const appName = 'test';
      const scopeType = ScopeType.SHARED;
      const type = LibraryType.MODEL;
      const newAppName = 'new-app-name';

      jest
        .spyOn(applicationPrompts, 'applicationPrompt')
        .mockReturnValue(Promise.resolve(appName));

      jest
        .spyOn(contextPrompts, 'scopePrompt')
        .mockImplementation(() => Promise.resolve(context));

      jest
        .spyOn(projectPrompts, 'projectPrompt')
        .mockImplementation(() => Promise.resolve(`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`));

      jest
        .spyOn(scopePrompts, 'default')
        .mockImplementation(() => Promise.resolve(ScopeType.SHARED));

      jest
        .spyOn(typePrompts, 'default')
        .mockImplementation(() => Promise.resolve(LibraryType.MODEL));

      jest.spyOn(nrwlDevkit, 'formatFiles');

      jest.spyOn(inquirer, 'prompt').mockReturnValue(
        Promise.resolve({
          yes: true,
          value: newAppName
        })
      );

      jest.spyOn(nrwlWorkspaceGenerators, 'moveGenerator').mockImplementation(() => Promise.resolve());

      jest.spyOn(extractNameUtils, 'extractName').mockReturnValue(appName);

      jest.spyOn(validateModuleBoundaries, 'default');

      jest.spyOn(nrwlDevkit, 'updateJson').mockImplementation(() => {
      });

      await generateWorkspaceLibrary(tree, {
        context,
        name: `${appName}-${mockAppSuffix}`,
        scopeType,
        type,
      });

      tree.write(
        './angular.json',
        JSON.stringify({
          $schema: './node_modules/nx/schemas/workspace-schema.json',
          version: 2,
          projects: {
            [`${context}-${scopeType}-${type}-${appName}-${mockAppSuffix}`]: `libs/${context}/${scopeType}/${type}/${appName}-${mockAppSuffix}`,
          },
        })
      );

      await move(tree, {});
      expect(validateModuleBoundaries.default).toHaveBeenCalledWith(tree, {fix: true});
    });
  });
});
