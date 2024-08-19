import path from "node:path";
import fsPromises from "node:fs/promises";
import fs from "node:fs";
import { canRead, writeStringToFile } from "from-anywhere/node";
import { getSrcRelativeFileId } from "from-anywhere/node";
import { objectMapAsync } from "from-anywhere";
import { setJsonKey } from "from-anywhere/node";
import { newOperation } from "./newOperation.js";
import { executeCommandQuietUnlessFail } from "./executeCommandQuietUnlessFail.js";
/**
 * Creates a new operation with files with content
 *
 * Returns the final operation base path (or undefined if something went wrong)
 *
 * NB: relative paths must be relative to OPERATION ROOT, not src root! They must also lead to files in src, this thing is still buggy otherwise!
 *
 * TODO: Remove the buggyness
 */
export const newOperationWithFiles = async (name, description, 
/**
 * NB: relative paths must be relative to OPERATION ROOT, not src root!
 */
srcFileContentObject, config) => {
    const destinationPath = config?.destinationPath;
    // 2. calculate simplest index.ts (no exposure of merged types object or tests)
    const indexFileContent = Object.keys(srcFileContentObject)
        .map((operationRelativeTypescriptFilePath) => {
        return `export * from "./${getSrcRelativeFileId(operationRelativeTypescriptFilePath)}";`;
    })
        .join("\n");
    const srcFileContentObjectWithIndex = { ...srcFileContentObject, "src/index.ts": indexFileContent };
    if (config?.dryrun) {
        await Promise.all(Object.keys(srcFileContentObject).map((operationRelativePath) => {
            const assetsPath = path.join(import.meta.dir, "..", "..", "assets", "generated", operationRelativePath);
            console.log(`written to ${assetsPath}`);
            return writeStringToFile(assetsPath, srcFileContentObject[operationRelativePath]);
        }));
        return;
    }
    // 3. make new operation
    const actualBasePath = await newOperation({
        name,
        destinationPath,
        description,
        type: config?.type,
    });
    if (!actualBasePath) {
        console.log("Failed creating new operation", { type: "error" });
        return;
    }
    if (!fs.existsSync(actualBasePath)) {
        console.log(`actualBasePath does not exist: ${actualBasePath}`, {
            type: "error",
        });
        return;
    }
    // The wished base path
    const wishedBasePath = path.join(destinationPath, name);
    // 4. write files to src
    await objectMapAsync(srcFileContentObjectWithIndex, async (operationRelativeTypescriptFilePath, content) => {
        const srcPath = path.join(actualBasePath, operationRelativeTypescriptFilePath);
        await writeStringToFile(srcPath, content);
        return;
    });
    /** NB: if this is true, the operation is new and has a never-used name, this means it also needs to be installed before building! */
    const isOperationNew = wishedBasePath !== actualBasePath;
    const shouldOverwrite = isOperationNew &&
        config?.overwriteIfExists &&
        fs.existsSync(wishedBasePath);
    const finalOperationBasePath = shouldOverwrite
        ? wishedBasePath
        : actualBasePath;
    if (!config?.skipBuild) {
        const isBuildSuccessful = executeCommandQuietUnlessFail({
            command: "tsc",
            cwd: finalOperationBasePath,
            description: `tsc ${path.parse(finalOperationBasePath).base}`,
        });
        if (!isBuildSuccessful) {
            console.log("Building failed", { type: "error" });
            return;
        }
    }
    // remove operation if it's already there and rename new operation to that target name
    if (shouldOverwrite) {
        /**
         * first set the name to the same as the to be removed folder.
         * NB: there are now two packages with the same name, yarn install will error
         */
        const packageJsonPath = path.join(actualBasePath, "package.json");
        const hasAvailablePackageJson = fs.existsSync(packageJsonPath) && (await canRead(packageJsonPath));
        if (!hasAvailablePackageJson) {
            return;
        }
        await setJsonKey({
            jsonPath: packageJsonPath,
            keyLocation: "name",
            value: name,
        });
        if (fs.existsSync(wishedBasePath)) {
            //then remove the original operation
            await fsPromises.rm(wishedBasePath, { recursive: true });
        }
        if (fs.existsSync(actualBasePath)) {
            // then rename the new operation to the original operation path
            await fsPromises.rename(actualBasePath, wishedBasePath);
        }
    }
    return finalOperationBasePath;
};
//# sourceMappingURL=newOperationWithFiles.js.map