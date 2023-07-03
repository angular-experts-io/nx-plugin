import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import generator from './generator';
import { ValidateGeneratorSchema } from './schema';
import * as configHelper from '../shared/config/config.helper';

// sanity tests, for generators it's better to keep it open and flexible to allow easy extension
// and adjustment of the logic in the future

describe('validate generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('.gitignore', '');
    jest
      .spyOn(configHelper, 'getScopes')
      .mockImplementation(() => Promise.resolve(['shared']));
  });

  it('fixes out of sync tags', async () => {
    const options: ValidateGeneratorSchema = { fix: true };
    const mockProjectJson = {
      name: 'shared-util-example',
      tags: ['scope:shared', 'type:util', 'wrong'],
    };
    const mockProjectJsonPath = 'libs/shared/util/example/project.json';
    tree.write(mockProjectJsonPath, JSON.stringify(mockProjectJson));
    const mockEslintrcJson = {
      overrides: [
        {
          rules: {
            '@nx/enforce-module-boundaries': ['error', { depConstraints: [] }],
          },
        },
      ],
    };
    const mockEslintrcJsonPath = '.eslintrc.json';
    tree.write(mockEslintrcJsonPath, JSON.stringify(mockEslintrcJson));
    const mockSchemaJson = {
      properties: {
        scope: {
          'x-prompt': {
            items: [],
          },
        },
      },
    };
    const mockSchemaJsonPath =
      'libs/tooling/nx-plugin/src/generators/lib/schema.json';
    tree.write(mockSchemaJsonPath, JSON.stringify(mockSchemaJson));

    await generator(tree, options);

    expect(tree).toBeDefined();
    expect(readJson(tree, mockProjectJsonPath).tags).toEqual([
      'scope:shared',
      'type:util',
    ]);
  });
});
