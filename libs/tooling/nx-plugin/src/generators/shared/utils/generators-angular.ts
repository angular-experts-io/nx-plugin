import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';

export const DEFAULT_ANGULAR_GENERATOR_COMPONENT_OPTIONS = {
  export: true,
  style: 'scss',
  displayBlock: true,
  changeDetection: 'OnPush',
};

export const angularComponentGenerator = wrapAngularDevkitSchematic(
  '@schematics/angular',
  'component'
);
