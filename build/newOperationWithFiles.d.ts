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
export declare const newOperationWithFiles: (name: string, description: string | undefined, srcFileContentObject: {
    [operationRelativeTypescriptFilePath: string]: string;
}, config?: {
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
}) => Promise<undefined | string>;
//# sourceMappingURL=newOperationWithFiles.d.ts.map