/// <reference types="node" />

import * as native from "./native";

export let utills = {
    /**
     * Не работает. Временно вынесено в js
     */
    fileCoding(filePath: string): number {
        let res: any;
        let fd: number = native.fs.openSync(filePath, "r");
        let buffer: Buffer = new Buffer(2);

        native.fs.readSync(fd, buffer, 0, 2, 0);

        if (buffer.toString("utf8", 0, 2) === "--") {
            res = trusted.DataFormat.PEM;
        } else {
            res = trusted.DataFormat.DER;
        }

        native.fs.closeSync(fd);

        return res;
    },

    /**
     * Check file exists
     * @param  {string} filePath
     * @returns boolean
     */
    fileExists(filePath: string): boolean {
        try {
            return native.fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    },

    /**
     * Check exists directory
     * @param  {string} dirPath
     */
    dirExists(dirPath: string): boolean {
        try {
            return native.fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }
}

