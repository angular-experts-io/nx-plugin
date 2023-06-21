import * as inquirer from 'inquirer';
import { Tree } from '@nrwl/devkit';

export const CONFIG_FILE_NAME = '.ax.config.json';

interface Config {
  contexts?: string[];
  prefix?: string;
  appSuffix?: string;
}

const DEFAULT_CONFIG_OPTIONS: Config = {
  contexts: ['sales', 'supply', 'production'],
  prefix: 'my-app',
  appSuffix: 'app',
};

export async function createAndGetConfigFileIfNonExisting(
  tree: Tree,
  config?: Config
): Promise<Config> {
  console.log('Config', config);
  const configurationFileBuffer = tree.read(CONFIG_FILE_NAME);
  const configFile: Config = configurationFileBuffer
    ? JSON.parse(configurationFileBuffer.toString())
    : null;

  if (
    configFile?.contexts?.length > 0 &&
    configFile.prefix &&
    configFile.appSuffix
  ) {
    return;
  }

  if (!configFile) {
    console.log(
      `No configuration file found. Don't worry, we will create one for you.`
    );
  }

  let contexts;
  let prefix;
  let appSuffix;

  if (!configFile?.contexts) {
    const contextsString = config.contexts || await inquirer.prompt({
      name: 'availableContexts',
      message: `Please enter all contexts (comma separated) you want to use in your project.
        (default: ${DEFAULT_CONFIG_OPTIONS.contexts.join(', ')})`,
    });
    contexts = contextsString.availableContexts.split(',');
  }

  if (!configFile?.prefix) {
    prefix = config.prefix || (await inquirer.prompt({
      name: 'companyPrefix',
      message: `Please enter your company prefix or company name. (default: ${DEFAULT_CONFIG_OPTIONS.prefix})`,
    })).companyPrefix;
  }

  if (!configFile?.appSuffix) {
    appSuffix = config.appSuffix || (await inquirer.prompt({
      name: 'suffix',
      message: `Please enter a suffix for generated applications. (default: ${DEFAULT_CONFIG_OPTIONS.appSuffix})`,
    })).suffix;
  }

  console.log('Contexts', contexts);
  console.log('Prefix', prefix);
  console.log('AppSuffix', appSuffix);

  const CONFIG_FILE = {
    contexts: contexts || DEFAULT_CONFIG_OPTIONS.contexts,
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

export async function getContexts(tree: Tree): Promise<string[] | undefined> {
  const { contexts } = await getConfig(tree);
  if (!contexts) {
    printWarningMessageForMissingConfigProperty(
      'contexts',
      `[${DEFAULT_CONFIG_OPTIONS.contexts.join(', ')}]`
    );
  }
  return contexts || DEFAULT_CONFIG_OPTIONS.contexts;
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
    return JSON.parse(configurationFileBuffer.toString()).contexts;
  }
}
