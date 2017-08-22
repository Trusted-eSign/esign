import { createSelector } from "reselect";
import { mapToArr } from "../utils";

export const certificatesGetter = (state) => state.certificates.entities;
export const filtersGetter = (state) => state.filters;
export const filesGetter = (state) => state.files.entities;
export const idGetter = (state, props) => props.id;
export const operationGetter = (state) => state.operation;

const activeGetter = (state, props) => props.active;

export const filteredCertificatesSelector = createSelector(certificatesGetter, filtersGetter, operationGetter, (certificates, filters, operation) => {
  const { searchValue } = filters;
  const search = searchValue.toLowerCase();

  return mapToArr(certificates).filter((certificate) => {
    return (
      certificate.hash.toLowerCase().match(search) ||
      certificate.issuerFriendlyName.toLowerCase().match(search) ||
      certificate.subjectFriendlyName.toLowerCase().match(search) ||
      certificate.serial.toLowerCase().match(search) ||
      certificate.notAfter.toLowerCase().match(search) ||
      certificate.notBefore.toLowerCase().match(search) ||
      certificate.organizationName.toLowerCase().match(search) ||
      certificate.signatureAlgorithm.toLowerCase().match(search)
    );
  });
});

export const activeFilesSelector = createSelector(filesGetter, activeGetter, (files, active) => {
  return mapToArr(files).filter((file) => {
    return file.active === active;
  });
});
