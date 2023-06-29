import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson } from '@nrwl/devkit';

import generator from './generator';
import { AppGeneratorSchema } from './schema';
import * as configHelper from '../shared/config/config.helper';

// sanity tests, for generators it's better to keep it open and flexible to allow easy extension
// and adjustment of the logic in the future
describe('app generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('.gitignore', '');
  });

  describe('app', () => {
    it('should generate new app and add new scope to AX config and generator', async () => {
      jest.spyOn(configHelper, 'addScope').mockImplementation(() => Promise.resolve());

      tree.write(
        'libs/tooling/nx-plugin/src/generators/lib/schema.json',
        // mock schema.json
        JSON.stringify({
          properties: {
            scope: {
              'x-prompt': {
                items: [],
              },
            },
          },
        })
      );
      const options: AppGeneratorSchema = {
        name: 'example',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'example-app');
      expect(config).toBeDefined();
      expect(config.tags).toEqual(['type:app', 'scope:example-app']);
      expect(tree.exists('apps/example-app/project.json')).toBeTruthy();
      expect(
        tree.exists('apps/example-app/src/app/app.component.spec.ts')
      ).toBeFalsy();
      const depConstraints = readJson(tree, '.eslintrc.json').overrides[0]
        .rules['@nx/enforce-module-boundaries'][1].depConstraints;
      expect(
        depConstraints.find((c) => c.sourceTag === 'scope:example-app')
      ).toEqual({
        sourceTag: 'scope:example-app',
        onlyDependOnLibsWithTags: ['scope:shared', 'scope:example-app'],
      });
    });
  });
});
