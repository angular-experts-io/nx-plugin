export enum LibraryType {
  FEATURE = 'feature',
  DATA_ACCESS = 'data-access',
  UI = 'ui',
  UTIL = 'util',
  UTIL_FN = 'util-fn',
  MODEL = 'model',
  PATTERN = 'pattern',
}

export const AVAILABLE_LIBRARY_TYPES: { name: string; value: LibraryType }[] = [
  {
    name: 'Lazy Feature / Page / Business Flow (lazy loaded with routing / user navigation)',
    value: LibraryType.FEATURE,
  },
  {
    name: 'Pattern (eager loaded feature, for example main-layout, complex widget,...)',
    value: LibraryType.PATTERN,
  },
  {
    name: 'Data Access (NgRx state feature)',
    value: LibraryType.DATA_ACCESS,
  },
  {
    name: 'UI (reusable / view component)',
    value: LibraryType.UI,
  },
  {
    name: 'Util (Angular based reusable utility)',
    value: LibraryType.UTIL,
  },
  {
    name: 'Util Function (plain TypesScript function utility)',
    value: LibraryType.UTIL_FN,
  },
  {
    name: 'Model (interfaces, types, enums, consts)',
    value: LibraryType.MODEL,
  },
];
