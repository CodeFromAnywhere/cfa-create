import { newOperationWithFiles } from "./newOperationWithFiles.js";
export const main = async () => {
  await newOperationWithFiles(
    "test-operation",
    "This is amaaaaazzzz",
    { "src/test-operation.ts": "//this is a file\nexport const x = 1;" },
    { overwriteIfExists: true, destinationPath: process.cwd() },
  );
};

main();
