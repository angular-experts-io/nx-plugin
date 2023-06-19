import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson } from '@nrwl/devkit';

import generator from './generator';
import { AppGeneratorSchema } from './schema';

// sanity tests, for generators it's better to keep it open and flexible to allow easy extension
// and adjustment of the logic in the future

describe('app generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('.gitignore', '');
  });

  describe('app', () => {
    it('should generate new app and add new scope to module boundaries and generator', async () => {
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
      expect((config.targets as any).build.options.assets[0].input).toEqual(
        'libs/shared/assets/i18n/src'
      );
      expect((config.targets as any).build.options.assets[1].input).toEqual(
        'libs/shared/assets/images/src'
      );
      expect(
        (config.targets as any).build.options.stylePreprocessorOptions
          ?.includePaths
      ).toEqual([
        'libs/shared/styles/theme/src',
        'libs/shared/styles/components/src',
      ]);
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
