import { APPLY_DOCUMENTS_FILTERS, RESET_DOCUMENTS_FILTERS } from "../constants";

export function applyDocumentsFilters(filters: any) {
  return {
    payload: { filters },
    type: APPLY_DOCUMENTS_FILTERS,
  };
}

export function resetDocumentsFilters() {
  return {
    type: RESET_DOCUMENTS_FILTERS,
  };
}
