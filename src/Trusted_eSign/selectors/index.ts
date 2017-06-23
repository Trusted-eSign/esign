import { createSelector } from "reselect";
import { mapToArr } from "../utils";

export const certificatesGetter = (state) => state.certificates.entities;
export const filtersGetter = (state) => state.filters;
export const idGetter = (state, props) => props.id;

export const filteredCertificatesSelector = createSelector(certificatesGetter, filtersGetter, (certificates, filters) => {
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
