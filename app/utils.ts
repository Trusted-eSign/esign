/// <reference types="node" />

import {Map, OrderedMap} from "immutable";
import * as native from "./native";

export function arrayToMap(arr, RecordModel) {
    return arr.reduce((acc, el) => acc.set(el.id, RecordModel ? new RecordModel(el) : el), new OrderedMap({}))
}

export function mapToArr(obj) {
    return obj.valueSeq().toArray()
}

export function extFile(filename: string) {
    const ext = filename.split(".").pop();
    let file_type: string;
    if (ext === "sig") {
        file_type = "sign_type_icon";
    } else if (ext === "enc") {
        file_type = "encrypt_type_icon";
    } else if (ext === "zip") {
        file_type = "zip_type_icon";
    } else if (ext === "docx" || ext === "doc") {
        file_type = "word_type_icon";
    } else if (ext === "xlsx" || ext === "xls") {
        file_type = "excel_type_icon";
    } else if (ext === "pdf") {
        file_type = "pdf_type_icon";
    } else {
        file_type = "file_type_icon";
    }
    return file_type;
}

function padString(input: string): string {
  const segmentLength = 4;
  const stringLength = input.length;
  const diff = stringLength % segmentLength;

  if (!diff) {
      return input;
  }

  let position = stringLength;
  let padLength = segmentLength - diff;
  const paddedStringLength = stringLength + padLength;
  const buffer = new Buffer(paddedStringLength);

  buffer.write(input);

  while (padLength--) {
      buffer.write("=", position++);
  }

  return buffer.toString();
}

export function toBase64(base64url: string | Buffer): string {
  base64url = base64url.toString();
  return padString(base64url)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
}

export let utils = {
  /**
   * Не работает. Временно вынесено в js
   */
  fileCoding(filePath: string): number {
    const FD: number = native.fs.openSync(filePath, "r");
    const BUFFER: Buffer = new Buffer(2);
    let res: any;

    native.fs.readSync(FD, BUFFER, 0, 2, 0);

    if (BUFFER.toString("utf8", 0, 2) === "--") {
      res = trusted.DataFormat.PEM;
    } else {
      res = trusted.DataFormat.DER;
    }

    native.fs.closeSync(FD);

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
  },
};
