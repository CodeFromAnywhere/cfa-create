#!/usr/bin/env bun
import { newTemplate } from "./newTemplate.js";

/**
 * newTemplate can be used as CLI:
 *
 * Arguments:
 * - type (required): a folder from `new-template/assets/templates`
 * - destinationPath (optional): path where the template should be copied to (uses `cwd` by default)
 */
const newTemplateCli = () => {
  const [type, destinationPath] = process.argv.slice(2);

  newTemplate(type, destinationPath).then((basePath) => {
    if (basePath) {
      console.log(`Generated template`, { type });
    } else {
      console.log("Something went wrong");
    }
  });
};

newTemplateCli();
