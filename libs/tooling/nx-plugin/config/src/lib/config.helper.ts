import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';
import { updateJson } from '@nx/devkit';

export const CONFIG_FILE_NAME = '.ax.config.json';

interface Config {
  scopes?: string[];
  prefix?: string;
  appSuffix?: string;
}

const DEFAULT_CONFIG_OPTIONS: Required<Config> = {
  scopes: ['shared'],
  prefix: 'my-app',
  appSuffix: 'app',
};

export async function createAndGetConfigFileIfNonExisting(
  tree: Tree,
  config?: Config
): Promise<Config> {
  const configurationFileBuffer = tree.read(CONFIG_FILE_NAME);
  const configFile: Config = configurationFileBuffer
    ? JSON.parse(configurationFileBuffer.toString())
    : null;

  if (
    configFile?.scopes?.length &&
    configFile?.prefix &&
    configFile?.appSuffix
  ) {
    return DEFAULT_CONFIG_OPTIONS;
  }

  if (!configFile) {
    console.log(
      `No configuration file found. Don't worry, we will create one for you.`
    );
  }

  let scopes;
  let prefix;
  let appSuffix;

  if (!configFile?.scopes && !config?.scopes) {
    const contextsPrompt = await inquirer.prompt<{ availableContexts: string }>(
      {
        name: 'availableContexts',
        message: `Please enter all scopes (comma separated) you want to use in your project.
        (default: ${DEFAULT_CONFIG_OPTIONS.scopes?.join(', ')})`,
      }
    );
    scopes = contextsPrompt.availableContexts
      ? contextsPrompt.availableContexts.split(',')
      : DEFAULT_CONFIG_OPTIONS.scopes;
  } else if (config?.scopes) {
    scopes = config.scopes;
  }

  if (!configFile?.prefix) {
    prefix =
      config?.prefix ||
      (
        await inquirer.prompt<{ companyPrefix: string }>({
          name: 'companyPrefix',
          message: `Please enter your company prefix or company name. (default: ${DEFAULT_CONFIG_OPTIONS.prefix})`,
        })
      ).companyPrefix;
  }

  if (!configFile?.appSuffix) {
    appSuffix =
      config?.appSuffix ||
      (
        await inquirer.prompt({
          name: 'suffix',
          message: `Please enter a suffix for generated applications. (default: ${DEFAULT_CONFIG_OPTIONS.appSuffix})`,
        })
      ).suffix;
  }

  const CONFIG_FILE = {
    scopes: scopes || DEFAULT_CONFIG_OPTIONS.scopes,
    prefix: prefix || DEFAULT_CONFIG_OPTIONS.prefix,
    appSuffix: appSuffix || DEFAULT_CONFIG_OPTIONS.appSuffix,
  };
  tree.write(CONFIG_FILE_NAME, JSON.stringify(CONFIG_FILE));

  return CONFIG_FILE;
}

export async function getPrefix(tree: Tree): Promise<string | undefined> {
  const { prefix } = await getConfig(tree);
  if (!prefix) {
    printWarningMessageForMissingConfigProperty(
      'prefix',
      DEFAULT_CONFIG_OPTIONS.prefix
    );
  }
  return prefix || DEFAULT_CONFIG_OPTIONS.prefix;
}

export async function addScope(tree: Tree, scope: string) {
  await createAndGetConfigFileIfNonExisting(tree);

  updateJson(tree, CONFIG_FILE_NAME, (json) => ({
    ...json,
    scopes: [...json.scopes.filter((s: string) => s !== scope), scope],
  }));
}

export async function getScopes(tree: Tree): Promise<string[] | undefined> {
  const { scopes } = await getConfig(tree);
  if (!scopes) {
    printWarningMessageForMissingConfigProperty(
      'contexts',
      `[${DEFAULT_CONFIG_OPTIONS.scopes.join(', ')}]`
    );
  }
  return scopes || DEFAULT_CONFIG_OPTIONS.scopes;
}

export async function getAppSuffix(tree: Tree): Promise<string | undefined> {
  const { appSuffix } = await getConfig(tree);
  if (!appSuffix) {
    printWarningMessageForMissingConfigProperty(
      'appSuffix',
      DEFAULT_CONFIG_OPTIONS.appSuffix
    );
  }
  return appSuffix || DEFAULT_CONFIG_OPTIONS.appSuffix;
}

function printWarningMessageForMissingConfigProperty(
  propertyName: string,
  defaultValue: string
) {
  console.warn(`No value for ${propertyName} was found in ${CONFIG_FILE_NAME}.
    Using default ${propertyName}: ${defaultValue},
    feel free to adjust the ${propertyName} property it in ${CONFIG_FILE_NAME}.`);
}

async function getConfig(tree: Tree): Promise<Config> {
  const configurationFileBuffer = tree.read(CONFIG_FILE_NAME);

  if (!configurationFileBuffer) {
    return await createAndGetConfigFileIfNonExisting(tree);
  } else {
    return JSON.parse(configurationFileBuffer.toString());
  }
}
