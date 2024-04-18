#!/usr/bin/env bun
import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { renameTemplateFiles } from "from-anywhere/node";
import { getProjectRoot } from "from-anywhere/node";
/**
 *
 * Returns either the `basePath` of the created template, or undefined if something went wrong
 */
export const newTemplate = async (type, destinationPath) => {
    const manualProjectRoot = getProjectRoot(destinationPath);
    const source = path.resolve(import.meta.dir, "..", "assets", "templates", type);
    const templateExists = fs.existsSync(source);
    if (!templateExists) {
        console.log(`${type} cannot be generated yet. Create a template in assets/templates/${type}`);
        return;
    }
    const basePath = destinationPath
        ? destinationPath
        : path.join(process.cwd(), type);
    // const availableFolderName = await getAvailableOperationName(
    //   rootFolderPath,
    //   type,
    //   manualProjectRoot
    // );
    // const basePath = path.join(rootFolderPath, availableFolderName);
    // if (fs.existsSync(basePath)) {
    //   log(`${basePath} already exists`);
    //   return;
    // }
    // Make the non-existing folder
    await fsPromises.mkdir(basePath, { recursive: true });
    // Copy the template inthere
    await fsPromises.cp(source, basePath, { recursive: true });
    // Rename templatefiles if needed
    await renameTemplateFiles({ appDir: basePath });
    return basePath;
};
//# sourceMappingURL=newTemplate.js.map