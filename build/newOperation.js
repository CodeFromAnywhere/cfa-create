// import { OperationClassification } from "from-anywhere/types";
import { canRead } from "from-anywhere/node";
import path from "node:path";
import fsPromises from "node:fs/promises";
import fs from "node:fs";
import { setJsonKey } from "from-anywhere/node";
import { renameTemplateFiles } from "from-anywhere/node";
import { kebabCase } from "from-anywhere";
import { getAvailableOperationName } from "./getAvailableOperationName.js";
/**
 * # How to create a package/operation?
 *
 * This cli creates the correct tsconfig.json, package.json, .gitignore, folder setup, so you can get started immedeately.
 *
 * Returns either the `operationBasePath` of the created operation, or undefined if something went wrong
 *
 *
 */
export const newOperation = async (context) => {
    // NB: if we don't specify the type, create a node operation by default
    const type = context.type || "node-esm";
    const description = context.description;
    const destinationPath = context.destinationPath;
    const manualProjectRoot = context.manualProjectRoot;
    const folder = context.name ? kebabCase(context.name) : "untitled-operation";
    const source = path.resolve(import.meta.dir, "..", "..", "assets", "templates", type);
    const templateExists = fs.existsSync(source);
    if (!templateExists) {
        console.log(`${type} operations cannot be generated yet. Create a template in assets/templates/${type}`);
        return;
    }
    const rootFolderPath = destinationPath ? destinationPath : process.cwd();
    console.log({ rootFolderPath });
    const availableFolderName = await getAvailableOperationName(rootFolderPath, folder, manualProjectRoot);
    const operationBasePath = path.join(rootFolderPath, availableFolderName);
    // Make the non-existing folder
    await fsPromises.mkdir(operationBasePath, { recursive: true });
    // Copy the template inthere
    await fsPromises.cp(source, operationBasePath, { recursive: true });
    // Rename templatefiles if needed
    await renameTemplateFiles({ appDir: operationBasePath });
    const packageJsonPath = path.join(operationBasePath, "package.json");
    const canReadHere = await canRead(packageJsonPath);
    // console.log({ canReadHere, packageJsonPath });
    const hasAvailablePackageJson = fs.existsSync(packageJsonPath) && canReadHere;
    if (!hasAvailablePackageJson) {
        console.log("The template package.json was not copied succesfully", {
            type: "error",
        });
        return;
    }
    await setJsonKey({
        jsonPath: packageJsonPath,
        keyLocation: "name",
        value: availableFolderName,
    });
    if (description) {
        await setJsonKey({
            jsonPath: packageJsonPath,
            keyLocation: "description",
            value: description,
        });
    }
    return operationBasePath;
};
newOperation.config = {
    categories: ["admin"],
    isPublic: false,
};
//# sourceMappingURL=newOperation.js.map