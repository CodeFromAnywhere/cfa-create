#!/usr/bin/env bun
import { operationClassificationConst } from "from-anywhere/types";
import { newOperation } from "./newOperation.js";
/**
 * newOperation also works as CLI
 *
 * example: `newOperation [operation-name] [type]` in the folder where you want to create it. Optionally you can specify the type of operation as the second argument of the CLI
 *
 * Arguments (all optional):
 * - name: string
 * - type: `OperationClassification`
 * - description: string
 * - destinationPath: string
 */
const newOperationCli = async () => {
    const [name, type, description, destinationPath] = process.argv.slice(2);
    console.log(`Let's make a ${type || "node-cjs"} operation called ${name}`, {
        type: "important",
    });
    console.log("All types possible:", operationClassificationConst.join(", "));
    await newOperation({
        name,
        type: type,
        description,
        destinationPath,
    });
    console.log(`Generated operation`, {
        name,
        type,
        description,
        destinationPath,
    });
};
newOperationCli();
//# sourceMappingURL=newOperation.cli.js.map