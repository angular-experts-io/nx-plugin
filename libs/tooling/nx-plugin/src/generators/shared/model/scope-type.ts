export enum ScopeType {
  PUBLIC = 'public',
  SHARED = 'shared',
  APP_SPECIFIC = 'app-specific',
}

export function getAvailableScopeTypes(context: string) {
  return [
    {
      name: 'App specific (limited to single app)',
      value: ScopeType.APP_SPECIFIC,
    },
    {
      name: `Shared (limited to ${context.toUpperCase()} context)`,
      value: ScopeType.SHARED,
    },
    { name: 'Public (accessible from every context)', value: ScopeType.PUBLIC },
  ];
}
