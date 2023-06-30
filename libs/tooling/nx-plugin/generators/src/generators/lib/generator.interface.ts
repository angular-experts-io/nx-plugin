import { Tree } from '@nx/devkit';
import { Generator } from 'nx/src/config/misc-interfaces';

import { LibGeneratorSchema } from './schema';

export type LibType =
  | 'feature'
  | 'pattern'
  | 'state'
  | 'event'
  | 'ui'
  | 'util'
  | 'utilFn'
  | 'model';

export interface NormalizedSchema extends LibGeneratorSchema {
  nameDasherized: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

export interface DefaultOptions {
  [key: string]: string | number | boolean;
}

export interface LibTypeGenerator {
  libGenerator: Generator;
  libDefaultOptions: DefaultOptions;
  generators: { generator: Generator; defaultOptions: DefaultOptions }[];
  postprocess(tree: Tree, options: NormalizedSchema): void;
}

export type LibTypeGeneratorMap = {
  [key in LibType]: (options: NormalizedSchema) => LibTypeGenerator;
};
