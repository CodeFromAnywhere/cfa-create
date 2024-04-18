import path from "node:path";
import fsPromises from "node:fs/promises";
import fs from "node:fs";

import {
  canRead,
  executeCommandQuietUnlessFail,
  getProjectRoot,
  writeStringToFile,
} from "from-anywhere/node";
import { getSrcRelativeFileId } from "from-anywhere/node";
import { objectMapAsync } from "from-anywhere";
import { setJsonKey } from "from-anywhere/node";
import { projectRelativeGeneratedOperationsFolder } from "from-anywhere";
import { newOperation } from "./newOperation.js";
import { OperationClassification } from "from-anywhere/types";
/**
 * Creates a new operation with files with content
 *
 * Returns the final operation base path (or undefined if something went wrong)
 *
 * NB: relative paths must be relative to OPERATION ROOT, not src root! They must also lead to files in src, this thing is still buggy otherwise!
 *
 * TODO: Remove the buggyness
 */
export const newOperationWithFiles = async (
  name: string,
  description: string | undefined,
  /**
   * NB: relative paths must be relative to OPERATION ROOT, not src root!
   */
  srcFileContentObject: {
    [operationRelativeTypescriptFilePath: string]: string;
  },
  config?: {
    type?: OperationClassification;
    manualProjectRoot?: string;
    /**
     * folder path without the folder name of the package to be created
     *
     * if given, will place it here, otherwise, will place it in the default location (tools/generated for os projects, packages for bundled projects)
     */
    destinationPath?: string;
    /**
     * if true, overwrites the operation if it already exists. It does this in a way that it does not break the OS very long, because it removes the old one only after the new one has been created. The removal and renaming the new one to this target name happens almost instantaneously
     */
    overwriteIfExists?: boolean;
    overwriteCurrentOperationIfExists?: boolean;

    /**
     * skips yarn build if `true`
     */
    skipBuild?: boolean;
    /**
     * don't write anything, just return the files to create with the strings
     */
    dryrun?: boolean;
  },
): Promise<undefined | string> => {
  // 1. calculates operation base path
  const projectRoot = config?.manualProjectRoot || getProjectRoot();
  if (!projectRoot) {
    console.log("Not found projectroot", { type: "error" });
    return;
  }

  const defaultDestinationPath = path.join(
    projectRoot,
    projectRelativeGeneratedOperationsFolder,
  );

  const destinationPath = config?.destinationPath || defaultDestinationPath;

  // 2. calculate simplest index.ts (no exposure of merged types object or tests)
  const indexFileContent = Object.keys(srcFileContentObject)
    .map((operationRelativeTypescriptFilePath) => {
      return `export * from "./${getSrcRelativeFileId(
        operationRelativeTypescriptFilePath,
      )}";`;
    })
    .join("\n");

  const srcFileContentObjectWithIndex: {
    [operationRelativeTypescriptFilePath: string]: string;
    "src/index.ts": string;
  } = { ...srcFileContentObject, "src/index.ts": indexFileContent };

  if (config?.dryrun) {
    await Promise.all(
      Object.keys(srcFileContentObject).map((operationRelativePath) => {
        const assetsPath = path.join(
          import.meta.dir,
          "..",
          "..",
          "assets",
          "generated",
          operationRelativePath,
        );

        console.log(`written to ${assetsPath}`);

        return writeStringToFile(
          assetsPath,
          srcFileContentObject[operationRelativePath],
        );
      }),
    );

    return;
  }
  // 3. make new operation

  const actualBasePath = await newOperation({
    name,
    destinationPath,
    description,
    manualProjectRoot: projectRoot,
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
  await objectMapAsync(
    srcFileContentObjectWithIndex,
    async (operationRelativeTypescriptFilePath, content) => {
      const srcPath = path.join(
        actualBasePath,
        operationRelativeTypescriptFilePath,
      );

      await writeStringToFile(srcPath, content);

      return;
    },
  );

  /** NB: if this is true, the operation is new and has a never-used name, this means it also needs to be installed before building! */
  const isOperationNew = wishedBasePath !== actualBasePath;

  const shouldOverwrite =
    isOperationNew &&
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
    const hasAvailablePackageJson =
      fs.existsSync(packageJsonPath) && (await canRead(packageJsonPath));
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
