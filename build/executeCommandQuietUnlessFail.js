import { execSync } from "node:child_process";
/**
 * Executes a command without showing the result, unless the command fails, then it will log the output.,
 */
export const executeCommandQuietUnlessFail = (config) => {
    const { command, cwd, description } = config;
    if (description) {
        process.stdout.write(`${description} `);
    }
    try {
        const result = execSync(command, {
            cwd,
            encoding: "utf8",
            stdio: "pipe",
        });
        if (description)
            console.log("✅");
        return true;
    }
    catch (e) {
        if (description)
            console.log("❌");
        const error = e;
        console.log(e);
        console.log(`${command} went wrong:`, error?.stdout);
        return false;
    }
};
//# sourceMappingURL=executeCommandQuietUnlessFail.js.map