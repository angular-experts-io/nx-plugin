import {Tree} from "@nrwl/devkit";

import {createAndGetConfigFileIfNonExisting} from "../config/config.helper";

import {InitSchema} from "./schema";
import {green} from "chalk";

export default async function move(tree: Tree, schema: InitSchema) {
  const {contexts, prefix, appSuffix} = schema;
  await createAndGetConfigFileIfNonExisting(tree, {
    contexts,
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
