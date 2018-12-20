import * as fs from "fs";
import { OrderedMap, Record } from "immutable";
import { SERVICES_JSON, SETTINGS_JSON } from "../constants";
import { CertificateModel, DefaultReducerState as DefaultCertificatesReducerState } from "../reducer/certificates";
import { DefaultReducerState as DefaultRecipientsReducerState, RecipientModel } from "../reducer/recipients";
import { DefaultReducerState as DefaultServicesReducerState, ServiceModel, SettingsModel } from "../reducer/services";
import { fileExists } from "../utils";

let odata = {};

if (fileExists(SETTINGS_JSON)) {
  const data = fs.readFileSync(SETTINGS_JSON, "utf8");

  if (data) {
    try {
      let recipientsMap = new DefaultRecipientsReducerState();

      odata = JSON.parse(data);

      for (const recipient of odata.recipients) {
        recipientsMap = recipientsMap.setIn(["entities", recipient.certId], new RecipientModel({
          certId: recipient.certId,
        }));
      }

      odata.recipients = recipientsMap;

      if (odata.settings && !odata.settings.cloudCSP) {
        odata.settings.cloudCSP = {
          authURL: "https://dss.cryptopro.ru/STS/oauth",
          restURL: "https://dss.cryptopro.ru/SignServer/rest",
        };
      }
    } catch (e) {
      odata = {};
    }
  }
}

if (fileExists(SERVICES_JSON)) {
  const services = fs.readFileSync(SERVICES_JSON, "utf8");

  if (services) {
    try {
      let servicesMap = new DefaultServicesReducerState();
      let certificatesMap = new DefaultCertificatesReducerState();

      const data = JSON.parse(services);

      for (const service of data.services) {
        let mservice = new ServiceModel({ ...service });
        mservice = mservice.setIn(["settings"], new SettingsModel({ mobileNumber: service.settings.mobileNumber }));
        servicesMap = servicesMap.setIn(["entities", service.id], mservice);
      }

      odata.services = servicesMap;

      if (data.certificates) {
        for (const certificate of data.certificates) {
          certificatesMap = certificatesMap.setIn(["entities", certificate.id], new CertificateModel({ ...certificate }));
        }

        odata.certificates = certificatesMap;
      }

    } catch (e) {
      odata.services = {};
      odata.certificates = {};
    }
  }
}

export default odata;
