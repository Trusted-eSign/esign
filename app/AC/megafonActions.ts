import { fromJS, Map } from "immutable";
import request from "request";
import xml2js from "xml2js";
import { FAIL, START, SUCCESS } from "../constants";
import { GET_SIGN_STATUS, SIGN_DOCUMENT, SIGN_TEXT, SIGN_URI, STATUS_URI } from "../service/megafon/constants";
import { buildXML } from "../service/megafon/endpoint/sign";
import { buildXML as buildXMLStatus } from "../service/megafon/endpoint/status";
import { IGetSignStatus, ISignDocument, ISignText } from "../service/megafon/types";
import { md5, xorConvolutionMD5 } from "../utils";

const HEADERS = { "content-type": "text/xml" };
const METHOD = "POST";

/**
 * Подпись документа в МЭП Мегафон
 *
 * @export
 * @param {string} msisdn Мобильный номер SIM карты клиента с ЭП
 * @param {string} text Текст, который будет отображен на Мобильном Устройстве Абонента при подписании документа
 * @param {string} document Подписываемый документ (накладная, договор, скан и т.п.), передается в виде Base64
 * @param {string} [signType] Тип подписи. "Attached" | "Detached"
 */
export function signDocument(msisdn: string, text: string, document: string, signType?: "Attached" | "Detached") {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: SIGN_DOCUMENT + START,
    });

    const params: ISignDocument = {
      digest: xorConvolutionMD5(md5(document)),
      document,
      msisdn,
      signType,
      text: text + "/n" + xorConvolutionMD5(md5(text)),
    };

    const xml = buildXML(SIGN_DOCUMENT, params);

    if (!xml) {
      dispatch({
        type: SIGN_DOCUMENT + FAIL,
      });
    }

    request({
      body: xml,
      headers: HEADERS,
      method: METHOD,
      uri: SIGN_URI,
    }, (error, response, body) => {
      if (error) {
        dispatch({
          payload: {
            error,
            status: error && error.code ? error.code : "",
          },
          type: SIGN_DOCUMENT + FAIL,
        });
        return;
      }

      if (!error && response.statusCode === 200) {
        const mapSignResponse = objToMap(strXmlToObject(body));

        if (mapSignResponse && Map.isMap(mapSignResponse) && !mapSignResponse.isEmpty()) {
          const status = mapSignResponse.getIn(["S:Envelope", "S:Body", "ns2:signResponse", "ns2:status"]);

          if (status === 100) {
            const transactionId = mapSignResponse.getIn(["S:Envelope", "S:Body", "ns2:signResponse", "ns2:transaction_id"]);

            if (transactionId) {
              dispatch({
                payload: {
                  transactionId,
                },
                type: SIGN_DOCUMENT + SUCCESS,
              });
            }
          } else {
            dispatch({
              payload: {
                status,
              },
              type: SIGN_DOCUMENT + FAIL,
            });
          }
        } else {
          dispatch({
            type: SIGN_DOCUMENT + FAIL,
          });
        }
      } else {
        dispatch({
          type: SIGN_DOCUMENT + FAIL,
        });
      }
    });
  };
}

/**
 * Метод предназначен для подписания коротких текстов, с использованием МЭП
 *
 * @export
 * @param {string} msisdn Мобильный номер SIM карты клиента с ЭП
 * @param {string} text Подписываемый текст. Этот же текст будет отображен на Мобильном Устройстве Абонента.
 * @param {string} [signType] Тип подписи. "Attached" | "Detached"
 */
export function signText(msisdn: string, text: string, signType?: "Attached" | "Detached") {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: SIGN_TEXT + START,
    });

    const params: ISignText = {
      msisdn,
      signType,
      text: text + "/n" + xorConvolutionMD5(md5(text)),
    };

    const xml = buildXML(SIGN_TEXT, params);

    if (!xml) {
      dispatch({
        type: SIGN_TEXT + FAIL,
      });
    }

    request({
      body: xml,
      headers: HEADERS,
      method: METHOD,
      uri: SIGN_URI,
    }, (error, response, body) => {
      if (error) {
        dispatch({
          payload: {
            error,
            status: error && error.code ? error.code : "",
          },
          type: SIGN_TEXT + FAIL,
        });
        return;
      }

      if (!error && response.statusCode === 200) {
        const mapSignResponse = objToMap(strXmlToObject(body));

        if (mapSignResponse && Map.isMap(mapSignResponse) && !mapSignResponse.isEmpty()) {
          const status = mapSignResponse.getIn(["S:Envelope", "S:Body", "ns2:signResponse", "ns2:status"]);

          if (status === 100) {
            const transactionId = mapSignResponse.getIn(["S:Envelope", "S:Body", "ns2:signResponse", "ns2:transaction_id"]);

            if (transactionId) {
              dispatch({
                payload: {
                  transactionId,
                },
                type: SIGN_TEXT + SUCCESS,
              });
            }
          } else {
            dispatch({
              payload: {
                status,
              },
              type: SIGN_TEXT + FAIL,
            });
          }
        } else {
          dispatch({
            type: SIGN_TEXT + FAIL,
          });
        }
      } else {
        dispatch({
          type: SIGN_TEXT + FAIL,
        });
      }
    });
  };
}

/**
 * Метод предназначен для получения статуса подписания
 *
 * @export
 * @param {string} transaction_id Уникальный идентификатор транзакции
 */
// tslint:disable-next-line:variable-name
export function getSignStatus(transaction_id: string) {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: GET_SIGN_STATUS + START,
    });

    const params: IGetSignStatus = {
      transaction_id,
    };

    const xml = buildXMLStatus(GET_SIGN_STATUS, params);

    if (!xml) {
      dispatch({
        type: GET_SIGN_STATUS + FAIL,
      });
    }

    request({
      body: xml,
      headers: HEADERS,
      method: METHOD,
      uri: STATUS_URI,
    }, (error, response, body) => {
      if (error) {
        dispatch({
          payload: {
            error,
            status: error && error.code ? error.code : "",
          },
          type: GET_SIGN_STATUS + FAIL,
        });
        return;
      }

      if (!error && response.statusCode === 200) {
        const mapGetSignResponse = objToMap(strXmlToObject(body));

        if (mapGetSignResponse && Map.isMap(mapGetSignResponse) && !mapGetSignResponse.isEmpty()) {
          const status = mapGetSignResponse.getIn(["S:Envelope", "S:Body", "ns2:getSignStatusResponse", "ns2:status"]);

          if (status === "100") {
            const cms = mapGetSignResponse.getIn(["S:Envelope", "S:Body", "ns2:getSignStatusResponse", "ns2:cms"]);

            if (cms) {
              dispatch({
                payload: {
                  cms,
                },
                type: GET_SIGN_STATUS + SUCCESS,
              });
            } else {
              const signStatusList = mapGetSignResponse.getIn(["S:Envelope", "S:Body", "ns2:getSignStatusResponse", "ns2:signStatusList"]);

              if (signStatusList) {
                dispatch({
                  payload: {
                    signStatusList,
                  },
                  type: GET_SIGN_STATUS + SUCCESS,
                });
              }
            }
          } else {
            dispatch({
              payload: {
                status,
              },
              type: GET_SIGN_STATUS + FAIL,
            });
          }
        } else {
          dispatch({
            type: GET_SIGN_STATUS + FAIL,
          });
        }
      } else {
        dispatch({
          type: GET_SIGN_STATUS + FAIL,
        });
      }
    });
  };
}

const strXmlToObject = (data: string) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  let out;

  parser.parseString(data, (err, result) => {
    if (err) {
      out = undefined;
    }

    out = result;
  });

  return out;
};

const objToMap = (data: any) => {
  if (!data) {
    return undefined;
  }

  return Map(fromJS(data));
};
