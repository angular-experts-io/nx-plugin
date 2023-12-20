import path from 'path';
import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';

import { LibTypeGenerator, NormalizedSchema } from '../generator.interface';

export function modelTypeFactory(): LibTypeGenerator {
  return {
    libGenerator: libraryGenerator,
    libDefaultOptions: {
      bundler: 'none',
      unitTestRunner: 'none',
    },
    generators: [],
    postprocess,
  };
}

function postprocess(tree: Tree, options: NormalizedSchema) {
  tree.delete(
    path.join(options.projectRoot, options.nameDasherized, 'README.md')
  );
}
