import {createSelector} from "reselect";
import {mapToArr} from "../utils";

export const certificatesGetter = state => state.certificates.entities;
export const filtersGetter = state => state.filters;
export const idGetter = (state, props) => props.id;

export const filteredCertificatesSelector = createSelector(certificatesGetter, filtersGetter, (certificates, filters) => {
    return mapToArr(certificates);
});
