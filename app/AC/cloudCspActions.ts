import {
  CHANGE_DSS_AUTH_URL, CHANGE_DSS_REST_URL, FAIL,
  GET_CERTIFICATES_FROM_DSS, RESET_CLOUD_CSP, START, SUCCESS, USER_NAME,
} from "../constants";
import logger from "../winstonLogger";

export function changeAuthURL(authURL: string) {
  return {
    payload: { authURL },
    type: CHANGE_DSS_AUTH_URL,
  };
}

export function changeRestURL(restURL: string) {
  return {
    payload: { restURL },
    type: CHANGE_DSS_REST_URL,
  };
}

export function resetCloudCSP() {
  return {
    type: RESET_CLOUD_CSP,
  };
}

export function getCertificates(authURL: string, restURL: string, token: string) {
  return (dispatch) => {
    dispatch({
      type: GET_CERTIFICATES_FROM_DSS + START,
    });

    setTimeout(() => {
      let countOfCertificates = 0;
      let testCount = 0;

      try {
        window.request.get(`${restURL}/api/certificates`, {
          auth: {
            bearer: token,
          },
        }, (error: any, response: any, body: any) => {
          if (error) {
            throw new Error("CloudCSP.request_error");
          }
          const statusCode = response.statusCode;

          if (statusCode !== 200) {
            dispatch({
              payload: {
                statusCode,
              },
              type: GET_CERTIFICATES_FROM_DSS + FAIL,
            });
          } else {
            if (body && body.length) {
              const certificates: any[] = JSON.parse(body);
              countOfCertificates = certificates.length;

              for (const certificate of certificates) {
                const hcert = createX509FromString(certificate.CertificateBase64);

                if (hcert) {
                  try {
                    trusted.utils.Csp.installCertificateFromCloud(hcert, authURL, restURL, certificate.ID);

                    testCount++;

                    logger.log({
                      certificate: hcert.subjectName,
                      level: "info",
                      message: "",
                      operation: "Импорт сертификата",
                      operationObject: {
                        in: "CN=" + hcert.subjectFriendlyName + " (DSS)",
                        out: "Null",
                      },
                      userName: USER_NAME,
                    });
                  } catch (err) {
                    logger.log({
                      certificate: hcert.subjectName,
                      level: "error",
                      message: err.message ? err.message : err,
                      operation: "Импорт сертификата",
                      operationObject: {
                        in: "CN=" + hcert.subjectFriendlyName + " (DSS)",
                        out: "Null",
                      },
                      userName: USER_NAME,
                    });
                  }
                }
              }

              let allCertificatesInstalled = false;

              if (countOfCertificates && countOfCertificates === testCount) {
                allCertificatesInstalled = true;
              }

              dispatch({
                payload: {
                  allCertificatesInstalled,
                  statusCode: 200,
                },
                type: GET_CERTIFICATES_FROM_DSS + SUCCESS,
              });
            }
          }
        });
      } catch (e) {
        dispatch({
          type: GET_CERTIFICATES_FROM_DSS + FAIL,
        });
      }
    }, 0);
  };
}

/**
 * Create x509 certificate (trusted-crypto implementation) from string
 *
 * @param {string} certificateBase64 certificate content in base64 without headers
 * @returns {(trusted.pki.Certificate | undefined)} trusted.pki.Certificate or undefined if cannot create
 */
const createX509FromString = (certificateBase64: string): trusted.pki.Certificate | undefined => {
  const raw = `-----BEGIN CERTIFICATE-----\n${certificateBase64}\n-----END CERTIFICATE-----\n`;
  const rawLength = raw.length * 2;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  let hcert;

  for (let j = 0; j < rawLength; j++) {
    array[j] = raw.charCodeAt(j);
  }

  try {
    hcert = trusted.pki.Certificate.import(array, trusted.DataFormat.PEM);
    return hcert;
  } catch (e) {
    // error
  }

  return undefined;
};
