/**
 * # How to create a package/operation?
 *
 * This cli creates the correct tsconfig.json, package.json, .gitignore, folder setup, so you can get started immedeately.
 *
 * Returns either the `operationBasePath` of the created operation, or undefined if something went wrong
 *
 *
 */
export declare const newOperation: {
    (context: {
        name?: string;
        /**
         * Must be OperationClassification
         */
        type?: string;
        description?: string;
        /**
         * destinationPath without the operation folder itself
         *
         *
         * If not provided, uses the working directory from where the process was executed + an inferred foldername
         */
        destinationPath?: string;
    }): Promise<string | undefined>;
    config: {
        categories: string[];
        isPublic: false;
    };
};
//# sourceMappingURL=newOperation.d.ts.map