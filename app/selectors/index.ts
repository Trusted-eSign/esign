import { createSelector } from "reselect";
import { mapToArr } from "../utils";

export const certificatesGetter = (state) => state.certificates.entities;
export const containersGetter = (state) => state.containers.entities;
export const filtersGetter = (state) => state.filters;
export const filesGetter = (state) => state.files.entities;
export const remoteFilesGetter = (state) => state.remoteFiles.entities;
export const connectionsGetter = (state) => state.connections.entities;
export const idGetter = (state, props) => props.id;
export const operationGetter = (state, props) => props.operation;

const activeGetter = (state, props) => props.active;
const loadingGetter = (state, props) => props.loading;
const connectedGetter = (state, props) => props.connected;

export const filteredCertificatesSelector = createSelector(certificatesGetter, filtersGetter, operationGetter, (certificates, filters, operation) => {
  const { searchValue } = filters;
  const search = searchValue.toLowerCase();
  let сertificatesByOperations = mapToArr(certificates);

  if (operation === "sign") {
    сertificatesByOperations = сertificatesByOperations.filter((item: trusted.pkistore.PkiItem) => {
      return item.category === "MY" && item.key.length > 0;
    });
  } else if (operation === "encrypt") {
    сertificatesByOperations = сertificatesByOperations.filter((item: trusted.pkistore.PkiItem) => {
      return (item.category === "MY" || item.category === "AddressBook");
    });
  }

  сertificatesByOperations = сertificatesByOperations.sort((a, b) => {
    const aCertificateSN = a.subjectFriendlyName.toLowerCase();
    const bCertificateSN = b.subjectFriendlyName.toLowerCase();

    if (aCertificateSN < bCertificateSN) {
      return -1;
    }

    if (aCertificateSN > bCertificateSN) {
      return 1;
    }

    return 0;
  });

  return сertificatesByOperations.filter((certificate) => {
    return (
      certificate.hash.toLowerCase().match(search) ||
      certificate.issuerFriendlyName.toLowerCase().match(search) ||
      certificate.subjectFriendlyName.toLowerCase().match(search) ||
      certificate.serial.toLowerCase().match(search) ||
      certificate.notAfter.toString().toLowerCase().match(search) ||
      certificate.notBefore.toString().toLowerCase().match(search) ||
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

export const filteredContainersSelector = createSelector(containersGetter, filtersGetter, (containers, filters) => {
  const { searchValue } = filters;
  const search = searchValue.toLowerCase();
  let containersArr = mapToArr(containers);

  return containersArr.filter((container) => {
    return (
      container.name.toLowerCase().match(search)
    );
  });
});

export const connectionSelector = () => createSelector(connectionsGetter, idGetter, (connections, id) => {
  return connections.getIn(["entities", id]);
});

export const connectedSelector = createSelector(connectionsGetter, connectedGetter, (connections, connected) => {
  return mapToArr(connections).filter((connection) => {
    return connection.connected === connected;
  });
});

export const loadingRemoteFilesSelector = createSelector(remoteFilesGetter, loadingGetter, (files, loading) => {
  return mapToArr(files).filter((file) => {
    return file.loading === loading;
  });
});
