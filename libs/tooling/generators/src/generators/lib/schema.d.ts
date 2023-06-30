import {LibType} from './generator.interface';

export interface LibGeneratorSchema {
  name: string;
  type: LibType;
  scope?: string;
}
