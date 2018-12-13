// tslint:disable:object-literal-sort-keys

/*
Подписание документов и/или текстов с использованием API.
Сервис доступен по адресу https://msign.megafon.ru/mes-ws/sign?wsdl
*/

import { fromJS, Map } from "immutable";
import xml2js from "xml2js";
import { SIGN_DOCUMENT, SIGN_TEXT, VERIFY } from "../constants";
import { ISignDocument, ISignText, IVerify } from "../types";

const builder = new xml2js.Builder();
const partnerId = "digt";
const signType = "Detached";

const objSignDocument = {
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {
      "ws:signDocumentRequest": {
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
};

const mapSignDocument = Map(fromJS(objSignDocument));

const objSignText = {
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {
      "ws:signTextRequest": {
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
};

const mapSignText = Map(fromJS(objSignText));

const objVerify = {
  "soapenv:Envelope": {
    "$": {
      "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
      "xmlns:ws": "http://megalabs.ru/mes/ws-api",
    },
    "soapenv:Header": {},
    "soapenv:Body": {
      "ws:verifyRequest": {
        "ws:partner_id": {
          _: partnerId,
        },
        "ws:document": {
          _: "?",
        },
        "ws:signaure": {
          _: "?",
        },
      },
    },
  },
};

const mapVerify = Map(fromJS(objVerify));

export const buildXML = (template: "SIGN_DOCUMENT" | "SIGN_TEXT" | "VERIFY", inputParams: ISignDocument | ISignText | IVerify) => {
  switch (template) {
    case SIGN_DOCUMENT:
      const sdocumentBody = createSignDocumentBody(mapSignDocument.getIn(["soapenv:Envelope", "soapenv:Body", "ws:signDocumentRequest"]), inputParams);
      const sdocumentMap = mapSignDocument.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signDocumentRequest"], sdocumentBody);

      return builder.buildObject(sdocumentMap.toJS());

    case SIGN_TEXT:
      const stextBody = createSignTextBody(mapSignText.getIn(["soapenv:Envelope", "soapenv:Body", "ws:signTextRequest"]), inputParams);
      const stextMap = mapSignText.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signTextRequest"], stextBody);

      return builder.buildObject(stextMap.toJS());

    case VERIFY:
      const verifyBody = createVerifyBody(mapVerify.getIn(["soapenv:Envelope", "soapenv:Body", "ws:verifyRequest"]), inputParams);
      const verifyMap = mapVerify.setIn(["soapenv:Envelope", "soapenv:Body", "ws:verifyRequest"], verifyBody);

      return builder.buildObject(verifyMap.toJS());

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

const createVerifyBody = (body: Map<any, any>, inputParams: IVerify) => {
  let res = body
    .setIn(["ws:document", "_"], inputParams.document);

  if (inputParams.signature) {
    res = res.setIn(["ws:signaure", "_"], inputParams.signature);
  }

  return res;
};
