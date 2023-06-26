import {Tree} from "@nrwl/devkit";
import {green} from "chalk";

import {createAndGetConfigFileIfNonExisting} from "../config/config.helper";

import {InitSchema} from "./schema";

export default async function move(tree: Tree, schema: InitSchema) {
  const {scopes, prefix, appSuffix} = schema;
  await createAndGetConfigFileIfNonExisting(tree, {
    scopes,
    prefix,
    appSuffix
  });

  console.log(
    green(
      '✅ Setup complete - AX config successfully created under root.'
    )
  );
  console.log('From here on you can start using the AX Generators.');
}
