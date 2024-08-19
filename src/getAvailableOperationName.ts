import path from "node:path";
import fs from "node:fs";
/**
 * returns folder name
 *
 * finds the first foldername that is available in this folder but also there is nowhere an operation already with this name
 *
 * there is also getAvailableFolderPath for non-operation folders
 */
export const getAvailableOperationName = async (
  rootFolderPath: string,
  preferredFolderName: string,
): Promise<string> => {
  //making sure we make a folder that doesn't exist yet:
  let n = 0;
  let availableFolderName = preferredFolderName;

  while (true) {
    const folderAlreadyExists = fs.existsSync(
      path.join(rootFolderPath, availableFolderName),
    );

    // // TODO: Have cli provide operations object. everything is deemed available for now
    // const operations = {};

    // const operationAlreadyExists =
    //   (await getOperationPath(availableFolderName, {
    //     manualProjectRoot,
    //     notUseSdk: !!manualProjectRoot,
    //     operationPathsObject: operations,
    //   })) !== undefined;

    if (!folderAlreadyExists) break;

    n++;
    availableFolderName = `${preferredFolderName}${n}`;
  }

  return availableFolderName;
};
