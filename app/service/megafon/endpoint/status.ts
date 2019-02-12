// tslint:disable:object-literal-sort-keys

/*
Получение статусов операций при pull нотификации.
Сервис доступен по адресу https://msign.megafon.ru/mes-ws/status?wsdl
*/

import { fromJS, Map } from "immutable";
import xml2js from "xml2js";
import { GET_SIGN_STATUS } from "../constants";
import { IGetSignStatus } from "../types";

const builder = new xml2js.Builder();
const partnerId = "digt";

const mapTemplateRequest = Map(fromJS({
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {},
  },
}));

const mapGetSignStatusRequest = Map(fromJS({
  "ws:partner_id": {
    _: partnerId,
  },
  "ws:transaction_id": {
    _: "?",
  },
}));

export const buildXML = (template: "GET_SIGN_STATUS", inputParams: IGetSignStatus) => {
  switch (template) {
    case GET_SIGN_STATUS:
      const sstatusBody = createGetSignStatusBody(mapGetSignStatusRequest, inputParams);
      return builder.buildObject(mapTemplateRequest.setIn(["soapenv:Envelope", "soapenv:Body", "ws:getSignStatusRequest"], sstatusBody).toJS());

    default:
      return "";
  }
};

const createGetSignStatusBody = (body: Map<any, any>, inputParams: IGetSignStatus) => {
  return body
    .setIn(["ws:transaction_id", "_"], inputParams.transaction_id);
};
