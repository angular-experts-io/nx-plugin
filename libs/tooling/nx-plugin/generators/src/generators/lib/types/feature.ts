import path from 'path';
import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';

import { NormalizedSchema, LibTypeGenerator } from '../generator.interface';
import { extendEslintJson } from './helpers/eslint';

export function featureTypeFactory(
  options: NormalizedSchema
): LibTypeGenerator {
  const { scope } = options;
  return {
    libGenerator: libraryGenerator,
    libDefaultOptions: {
      lazy: true,
      routing: true,
      standalone: true,
      style: 'scss',
      skipTests: true,
      changeDetection: 'OnPush',
      ...(scope !== 'shared'
        ? {
            parent: `apps/${scope}/src/app/app.routes.ts`,
          }
        : {}),
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
  tree.delete(
    path.join(
      options.projectRoot,
      options.nameDasherized,
      'src',
      'lib',
      'lib.routes.ts'
    )
  );

  const pathToIndex = path.join(
    options.projectRoot,
    options.nameDasherized,
    'src',
    'index.ts'
  );
  const indexTsContent = tree.read(pathToIndex)?.toString();
  if(indexTsContent){
    tree.write(
      pathToIndex,
      indexTsContent.replace(
        'lib/lib.routes',
        `lib/${options.projectName}.routes`
      )
    );
  }
}
