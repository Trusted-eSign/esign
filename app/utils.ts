import * as crypto from "crypto";
import * as fs from "fs";
import { Map, OrderedMap } from "immutable";

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

export function isEncryptedKey(path: string) {
  const encPrivkeyHeader = "-----BEGIN ENCRYPTED PRIVATE KEY-----";
  const lengthForRead = encPrivkeyHeader.length;
  const fd = fs.openSync(path, "r");
  const buffer = new Buffer(lengthForRead);
  let res;

  fs.readSync(fd, buffer, 0, lengthForRead, 0);

  if (buffer.toString("utf8", 0, lengthForRead) === encPrivkeyHeader) {
    res = 1;
  } else {
    res = 0;
  }

  fs.close(fd);

  return res;
}

export function fileCoding(filePath: string): number {
  const FD: number = fs.openSync(filePath, "r");
  const BUFFER: Buffer = new Buffer(2);
  let res: any;

  fs.readSync(FD, BUFFER, 0, 2, 0);

  if (BUFFER.toString("utf8", 0, 2) === "--") {
    res = trusted.DataFormat.PEM;
  } else {
    res = trusted.DataFormat.DER;
  }

  fs.close(FD);

  return res;
}

/**
 * Check file exists
 * @param  {string} filePath
 * @returns boolean
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Check exists directory
 * @param  {string} dirPath
 */
export function dirExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

export const uuid = () => {
  const rnb = crypto.randomBytes(16).toString("hex");

  return rnb.substring(0, 8) + "-" + rnb.substring(8, 12) + "-" + rnb.substring(12, 16) + "-" + rnb.substring(16, 20) + "-" + rnb.substring(20);
};

export const randomSerial = () => {
  return Math.floor(Math.random() * 1000000000000000000);
};

export const validateSnils = (snils: string | number) => {
  let result = false;

  if (typeof snils === "number") {
    snils = snils.toString();
  } else if (typeof snils !== "string") {
    snils = "";
  }

  if (!snils.length) {
    return false;
  } else if (/[^0-9]/.test(snils)) {
    return false;
  } else if (snils.length !== 11) {
    return false;
  } else {
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(snils[i], 10) * (9 - i);
    }

    let checkDigit = 0;
    if (sum < 100) {
      checkDigit = sum;
    } else if (sum > 101) {
      checkDigit = parseInt(sum % 101, 10);
      if (checkDigit === 100) {
        checkDigit = 0;
      }
    }
    if (checkDigit === parseInt(snils.slice(-2), 10)) {
      result = true;
    } else {
      return false;
    }
  }
  return result;
};

export const validateInn = (inn: string | number) => {
  let result = false;

  if (typeof inn === "number") {
    inn = inn.toString();
  } else if (typeof inn !== "string") {
    inn = "";
  }

  if (!inn.length) {
    return false;
  } else if (/[^0-9]/.test(inn)) {
    return false;
  } else if ([10, 12].indexOf(inn.length) === -1) {
    return false;
  } else {
    const checkDigit = (inn, coefficients) => {
      let n = 0;

      // tslint:disable-next-line:forin
      for (const i in coefficients) {
        n += coefficients[i] * inn[i];
      }

      return parseInt(n % 11 % 10, 10);
    };

    switch (inn.length) {
      case 10:
        const n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
        if (n10 === parseInt(inn[9], 10)) {
          result = true;
        }
        break;

      case 12:
        const n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        const n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        if ((n11 === parseInt(inn[10], 10)) && (n12 === parseInt(inn[11], 10))) {
          result = true;
        }
        break;
    }

    if (!result) {
      return false;
    }
  }
  return result;
};

export const validateOgrnip = (ogrnip: string | number) => {
  let result = false;

  if (typeof ogrnip === "number") {
    ogrnip = ogrnip.toString();
  } else if (typeof ogrnip !== "string") {
    ogrnip = "";
  }

  if (!ogrnip.length) {
    return false;
  } else if (/[^0-9]/.test(ogrnip)) {
    return false;
  } else if (ogrnip.length !== 15) {
    return false;
  } else {
    const n15 = parseInt((parseInt(ogrnip.slice(0, -1), 10) % 13).toString().slice(-1), 10);
    if (n15 === parseInt(ogrnip[14], 10)) {
      result = true;
    } else {
      return false;
    }
  }
  return result;
}
