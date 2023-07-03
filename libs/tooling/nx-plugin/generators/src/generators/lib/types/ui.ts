import path from 'path';
import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';

import { NormalizedSchema, LibTypeGenerator } from '../generator.interface';
import { extendEslintJson } from './helpers/eslint';

export function uiTypeFactory(): LibTypeGenerator {
  return {
    libGenerator: libraryGenerator,
    libDefaultOptions: {
      standalone: true,
      skipModule: true,
      displayBlock: true,
      style: 'scss',
      changeDetection: 'OnPush',
    },
    generators: [],
    postprocess,
  };
}

function postprocess(tree: Tree, options: NormalizedSchema) {
  extendEslintJson(tree, 'angular', options);
  tree.delete(
    path.join(options.projectRoot, options.nameDasherized, 'README.md')
  );
}
