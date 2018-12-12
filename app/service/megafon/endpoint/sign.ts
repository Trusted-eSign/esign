// tslint:disable:object-literal-sort-keys

/*
Подписание документов и/или текстов с использованием API.
Сервис доступен по адресу https://msign.megafon.ru/mes-ws/sign?wsdl
*/

import { fromJS, Map } from "immutable";
import xml2js from "xml2js";
import { SIGN_DOCUMENT, SIGN_TEXT } from "../constants";
import { ISignDocument, ISignText } from "../types";

const builder = new xml2js.Builder();
const partnerId = "digt";
const signType = "Detached";

const signDocument = {
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {
      "ws:signDocumentRequest": {
        "soapenv:Body": {
          "ws:partner_id": {
            _: partnerId,
          },
          "ws:msisdn": {
            _: "?",
          },
          "ws:text": {
            _: "?",
          },
          "ws:document": {
            _: "?",
          },
          "ws:signType": {
            _: signType,
          },
          "ws:digest": {
            _: "?",
          },
        },
      },
    },
  },
};

const signDocumentMap = Map(fromJS(signDocument));

const signText = {
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {
      "ws:signTextRequest": {
        "soapenv:Body": {
          "ws:partner_id": {
            _: partnerId,
          },
          "ws:msisdn": {
            _: "?",
          },
          "ws:text": {
            _: "?",
          },
          "ws:signType": {
            _: signType,
          },
        },
      },
    },
  },
};

const signTextMap = Map(fromJS(signText));

export const buildXML = (template: string, inputParams: ISignDocument) => {
  switch (template) {
    case SIGN_DOCUMENT:
      const sdocumentBody = createSignDocumentBody(signDocumentMap.getIn(["soapenv:Envelope", "soapenv:Body", "ws:signDocumentRequest", "soapenv:Body"]), inputParams);
      const sdocumentMap = signDocumentMap.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signDocumentRequest", "soapenv:Body"], sdocumentBody);

      return builder.buildObject(sdocumentMap.toJS());

    case SIGN_TEXT:
      const stextBody = createSignTextBody(signTextMap.getIn(["soapenv:Envelope", "soapenv:Body", "ws:signTextRequest", "soapenv:Body"]), inputParams);
      const stextMap = signTextMap.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signTextRequest", "soapenv:Body"], stextBody);

      return builder.buildObject(stextMap.toJS());

    default:
      return "";
  }
};

const createSignDocumentBody = (body: Map<any, any>, inputParams: ISignDocument) => {
  let res = body
    .setIn(["ws:msisdn", "_"], inputParams.msisdn)
    .setIn(["ws:text", "_"], inputParams.text)
    .setIn(["ws:document", "_"], inputParams.document)
    .setIn(["ws:digest", "_"], inputParams.digest);

  if (inputParams.signType) {
    res = res.setIn(["ws:signType", "_"], inputParams.signType);
  }

  return res;
};

const createSignTextBody = (body: Map<any, any>, inputParams: ISignText) => {
  let res = body
    .setIn(["ws:msisdn", "_"], inputParams.msisdn)
    .setIn(["ws:text", "_"], inputParams.text);

  if (inputParams.signType) {
    res = res.setIn(["ws:signType", "_"], inputParams.signType);
  }

  return res;
};
