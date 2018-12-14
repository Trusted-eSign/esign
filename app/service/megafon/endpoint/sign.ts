// tslint:disable:object-literal-sort-keys

/*
Подписание документов и/или текстов с использованием API.
Сервис доступен по адресу https://msign.megafon.ru/mes-ws/sign?wsdl
*/

import { fromJS, List, Map } from "immutable";
import xml2js from "xml2js";
import { MULTIPLY_SIGN, SIGN_DOCUMENT, SIGN_TEXT, VERIFY } from "../constants";
import { IMultiplysign, ISignDocument, ISignText, IVerify } from "../types";

const builder = new xml2js.Builder({ explicitArray: false });
const partnerId = "digt";
const signType = "Detached";

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

const mapSignDocumentRequest = Map(fromJS({
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
}));

const mapSignTextRequest = Map(fromJS({
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
}));

const mapVerifyRequest = Map(fromJS({
  "ws:partner_id": {
    _: partnerId,
  },
  "ws:document": {
    _: "?",
  },
  "ws:signaure": {
    _: "?",
  },
}));

const mapMultiplySignRequest = Map(fromJS({
  "ws:partner_id": {
    _: partnerId,
  },
  "ws:msisdn": {
    _: "?",
  },
  "ws:text": {
    _: "?",
  },
  "ws:documentList": {},
  "ws:signType": {
    _: signType,
  },
}));

export const buildXML = (template: "MULTIPLY_SIGN" | "SIGN_DOCUMENT" | "SIGN_TEXT" | "VERIFY", inputParams: IMultiplysign | ISignDocument | ISignText | IVerify) => {
  switch (template) {
    case MULTIPLY_SIGN:
      const smultiBody = createMultiplySignBody(mapMultiplySignRequest, inputParams);
      return builder.buildObject(mapTemplateRequest.setIn(["soapenv:Envelope", "soapenv:Body", "ws:multiplySignRequest"], smultiBody).toJS());

    case SIGN_DOCUMENT:
      const sdocumentBody = createSignDocumentBody(mapSignDocumentRequest, inputParams);
      return builder.buildObject(mapTemplateRequest.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signDocumentRequest"], sdocumentBody).toJS());

    case SIGN_TEXT:
      const stextBody = createSignTextBody(mapSignTextRequest, inputParams);
      return builder.buildObject(mapTemplateRequest.setIn(["soapenv:Envelope", "soapenv:Body", "ws:signTextRequest"], stextBody).toJS());

    case VERIFY:
      const verifyBody = createVerifyBody(mapVerifyRequest, inputParams);
      return builder.buildObject(mapTemplateRequest.setIn(["soapenv:Envelope", "soapenv:Body", "ws:verifyRequest"], verifyBody).toJS());

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

const createMultiplySignBody = (body: Map<any, any>, inputParams: IMultiplysign) => {
  let res = body
    .setIn(["ws:msisdn", "_"], inputParams.msisdn)
    .setIn(["ws:text", "_"], inputParams.text);

  let documentList = List();

  for (const document of inputParams.documentList) {
    const documentData = Map(fromJS({
      "ws:documentData": {
        "ws:document": document.document,
        "ws:digest": document.digest,
      },
    }));

    documentList = documentList.push(documentData);
  }

  if (documentList && !documentList.isEmpty()) {
    res = res.setIn(["ws:documentList"], documentList);
  }

  if (inputParams.signType) {
    res = res.setIn(["ws:signType", "_"], inputParams.signType);
  }

  return res;
};
