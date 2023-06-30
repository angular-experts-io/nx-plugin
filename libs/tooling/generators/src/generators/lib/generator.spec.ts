import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { LibGeneratorSchema } from './schema';

// sanity tests, for generators it's better to keep it open and flexible to allow easy extension
// and adjustment of the logic in the future

describe('lib generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('.gitignore', '');
  });

  describe('model', () => {
    it('should generate model library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'model',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-model-example');
      expect(config).toBeDefined();
      expect(tree.exists('libs/shared/model/example/package.json')).toBeFalsy();
      expect(
        tree.exists('libs/shared/model/example/src/lib/shared-model-example.ts')
      ).toBeTruthy();
    });

    it('should generate model library (complex name - class)', async () => {
      const options: LibGeneratorSchema = {
        name: 'exampleComplexName',
        type: 'model',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(
        tree,
        'shared-model-example-complex-name'
      );
      expect(config).toBeDefined();
      expect(
        tree.exists('libs/shared/model/example-complex-name/package.json')
      ).toBeFalsy();
      expect(
        tree.exists(
          'libs/shared/model/example-complex-name/src/lib/shared-model-example-complex-name.ts'
        )
      ).toBeTruthy();
      expect(
        tree.exists('libs/shared/model/example-complex-name/package.json')
      ).toBeFalsy();
    });

    it('should generate model library (complex name - dasherized)', async () => {
      const options: LibGeneratorSchema = {
        name: 'example-complex-name',
        type: 'model',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(
        tree,
        'shared-model-example-complex-name'
      );
      expect(config).toBeDefined();
      expect(
        tree.exists('libs/shared/model/example-complex-name/package.json')
      ).toBeFalsy();
      expect(
        tree.exists(
          'libs/shared/model/example-complex-name/src/lib/shared-model-example-complex-name.ts'
        )
      ).toBeTruthy();
    });
  });

  describe('util-fn', () => {
    it('should generate util-fn library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'utilFn',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-util-fn-example');
      expect(config).toBeDefined();
      expect(
        tree.exists('libs/shared/util-fn/example/package.json')
      ).toBeFalsy();
      expect(
        tree.exists(
          'libs/shared/util-fn/example/src/lib/shared-util-fn-example.ts'
        )
      ).toBeTruthy();
      expect(
        tree.exists(
          'libs/shared/util-fn/example/src/lib/shared-util-fn-example.spec.ts'
        )
      ).toBeTruthy();
    });
  });

  describe('util', () => {
    it('should generate util library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'util',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-util-example');
      expect(config).toBeDefined();
      expect(tree.exists('libs/shared/util/example/package.json')).toBeFalsy();
      expect(
        tree.exists('libs/shared/util/src/lib/example.service.ts')
      ).toBeFalsy();
      expect(
        tree.exists(
          'libs/shared/util/example/src/lib/shared-util-example.service.ts'
        )
      ).toBeTruthy();
      expect(
        tree.exists(
          'libs/shared/util/example/src/lib/shared-util-example.service.spec.ts'
        )
      ).toBeTruthy();
    });
  });

  describe('ui', () => {
    it('should generate ui library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'ui',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-ui-example');
      expect(config).toBeDefined();
      expect(tree.exists('libs/shared/ui/example/package.json')).toBeFalsy();
      expect(tree.exists('libs/shared/ui/example/README.md')).toBeFalsy();
    });
  });

  describe('state', () => {
    it('should generate state library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'state',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(
        tree,
        'shared-state-example'
      );
      expect(config).toBeDefined();
      expect(
        tree.exists('libs/shared/state/example/package.json')
      ).toBeFalsy();
      expect(
        tree.exists('libs/shared/state/example/README.md')
      ).toBeFalsy();
      expect(
        tree.exists(
          'libs/shared/state/example/src/lib/shared-state-example.actions.ts'
        )
      ).toBeFalsy();
    });
  });

  describe('pattern', () => {
    it('should generate pattern library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'pattern',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-pattern-example');
      expect(config).toBeDefined();
      expect(tree.exists('libs/shared/pattern/example/lib/')).toBeFalsy();
      expect(
        tree.exists('libs/shared/pattern/example/package.json')
      ).toBeFalsy();
      expect(tree.exists('libs/shared/pattern/example/README.md')).toBeFalsy();
    });
  });

  describe('feature', () => {
    it('should generate feature library', async () => {
      const options: LibGeneratorSchema = {
        name: 'example',
        type: 'feature',
        scope: 'shared',
      };
      await generator(tree, options);
      const config = readProjectConfiguration(tree, 'shared-feature-example');
      expect(config).toBeDefined();
      expect(
        tree.exists(
          'libs/shared/feature/example/src/lib/shared-feature-example.routes.ts'
        )
      ).toBeTruthy();
      expect(
        tree.exists('libs/shared/feature/example/src/lib/lib.routes.ts')
      ).toBeFalsy();
      expect(
        tree.exists('libs/shared/feature/example/package.json')
      ).toBeFalsy();
      expect(tree.exists('libs/shared/feature/example/README.md')).toBeFalsy();
    });
  });
});
