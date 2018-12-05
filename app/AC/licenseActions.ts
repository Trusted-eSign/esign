import * as fs from "fs";
import {
  DELETE_ALL_TEMPORY_LICENSES, FAIL, LICENSE_PATH,
  LOAD_LICENSE, START, SUCCESS, VERIFY_LICENSE,
} from "../constants";
import { checkLicense } from "../trusted/jwt";
import { toBase64 } from "../utils";

export function deleteAllTemporyLicenses() {
  return (dispatch: (action: {}) => void, getState: () => any) => {
    const state = getState();
    const { connections } = state;
    const licenses = connections.get("licenses");

    licenses.forEach((license) => {
      if (license && license.license) {
        try {
          trusted.utils.Jwt.deleteLicense(license.license);
        } catch (e) {
          console.log("error", e);
        }
      }
    });

    dispatch({
      type: DELETE_ALL_TEMPORY_LICENSES,
    });
  };
}

export function verifyLicense(license?: string) {
  const licenseStatus = checkLicense(license);

  return {
    payload: { licenseStatus },
    type: VERIFY_LICENSE,
  };
}

export function loadLicense(license?: string) {
  return (dispatch: (action: {}) => void) => {
    dispatch({ type: LOAD_LICENSE + START });

    setTimeout(() => {
      let data = "";
      let licenseStatus = true;
      let parsedLicense;
      let buffer;
      let lic;
      let lic_format = "NONE"; // Type license: MTX - old license, JWT - license of jwt roken, TRIAL - триальная лицензия, NONE - license epsent
      let lic_error = 911; // CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE
      // Шаблон информации о лицензии для заполнения
      lic = {
        aud: "-",
        core: 65535,
        desc: "CryptoARM GOST",
        exp: 0,
        iat: 0,
        iss: 'ООО "Цифровые технологии"',
        jti: "",
        sub: "CryptoARM GOST",
      };

      if (license && license.length) {
        data = license;
      } else if (fs.existsSync(LICENSE_PATH)) {
        data = fs.readFileSync(LICENSE_PATH, "utf8");
      }

      if (data && data.length) {
        // Проверка на наличие основной лицензии старого формата
        const result = data.match(/[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}/ig);
        if (result != null) {
          lic_format = "MTX";
          const expirationTime = trusted.utils.Jwt.getExpirationTime(data);
          if (expirationTime === 0) { // лицензия корректна
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = true;
            lic_error = 900; // CTLICENSE_R_NO_ERROR
            dispatch({ payload: { data, lic, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
          } else if (expirationTime > 900 && expirationTime <= 912) { // Возвратился код ошибки
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = false;
            lic_error = expirationTime;
            dispatch({ payload: { data, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + FAIL });
          } else {
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = true;
            lic_error = 900; // CTLICENSE_R_NO_ERROR
            dispatch({ payload: { data, lic, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
          }
        } else {
          const result = data.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=\s\n\t]+$/);
          if (result != null) {
            lic_format = "JWT";
            const check = trusted.utils.Jwt.checkLicense(data);
            if (check === 0) {
              licenseStatus = true;
            } else {
              lic_error = check;
              licenseStatus = false;
            }
            const splitLicense = data.split(".");
            if (splitLicense[1]) {
              try {
                buffer = new Buffer(toBase64(splitLicense[1]), "base64").toString("utf8");
                parsedLicense = JSON.parse(buffer);
                if (parsedLicense.exp && parsedLicense.aud && parsedLicense.iat && parsedLicense.iss
                  && parsedLicense.jti && parsedLicense.sub) {
                  lic = parsedLicense;
                }

                if (check === 0) {
                  lic_error = 900; // CTLICENSE_R_NO_ERROR
                }

                dispatch({ payload: { data, lic, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
              } catch (e) {
                lic_format = "NONE"; // Лицензия отсутствует
                licenseStatus = false; // Статуст лицензии: 0 - не действует
                data = "";
                dispatch({ payload: { data, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + FAIL });
              }
            }
          }
        }
      } else {
        // // Проверка на наличие и истечение временной лицензии
        if (trusted.utils.Jwt.checkTrialLicense() === 1) {
          const expirationTimeTrial = trusted.utils.Jwt.getTrialExpirationTime();
          lic_format = "TRIAL"; // Работает триальная лицензия
          lic.exp = expirationTimeTrial;
          lic.iat = expirationTimeTrial - 14 * 86400;
          data = "";
          licenseStatus = true; // Статуст лицензии: 1 - действует
          lic_error = 900; // CTLICENSE_R_NO_ERROR
          dispatch({ payload: { data, lic, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
        } else {
          lic_format = "NONE"; // Лицензия отсутствует, т.к. триальная истекла
          licenseStatus = false; // Статуст лицензии: 0 - не действует
          data = "";
          const lic_error = 911; // CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE
          dispatch({ payload: { data, lic_format, licenseStatus, lic_error }, type: LOAD_LICENSE + FAIL });
        }
      }
    }, 0);
  };
}
