import { ADD_SERVICE, ADD_SERVICE_CERTIFICATE, CHANGE_SERVICE_SETTINGS, DELETE_SERVICE } from "../constants";
import { uuid } from "../utils";

export function addService(name: string, type: string) {
  const id = uuid();

  return {
    payload: {
      service: {
        id,
        name,
        type,
      },
    },
    type: ADD_SERVICE,
  };
}

export function deleteService(id: string) {
  return {
    payload: {
      id,
    },
    type: DELETE_SERVICE,
  };
}

export function changeServiceSettings(id: string, settings: any) {
  return {
    payload: {
      id,
      settings,
    },
    type: CHANGE_SERVICE_SETTINGS,
  };
}

export function addServiceCertificate(certificate: trusted.pki.Certificate, service: string, serviceId: string) {
  const certProps = {
    active: false,
    category: "MY",
    format: "PEM",
    hash: certificate.thumbprint,
    id: service + "_" + serviceId + "_" + certificate.thumbprint,
    issuerFriendlyName: certificate.issuerFriendlyName,
    issuerName: certificate.issuerName,
    key: "1",
    notAfter: certificate.notAfter,
    notBefore: certificate.notBefore,
    organizationName: certificate.organizationName,
    provider: service,
    publicKeyAlgorithm: certificate.publicKeyAlgorithm,
    serial: certificate.serialNumber,
    service,
    serviceId,
    signatureAlgorithm: certificate.signatureAlgorithm,
    signatureDigestAlgorithm: certificate.signatureDigestAlgorithm,
    status: true,
    subjectFriendlyName: certificate.subjectFriendlyName,
    subjectName: certificate.subjectName,
    verified: true,
    version: certificate.version,
    x509: certificate.export(trusted.DataFormat.PEM).toString(),
  };

  return {
    payload: {
      certificate: certProps,
    },
    type: ADD_SERVICE_CERTIFICATE,
  };
}
