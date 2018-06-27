import { createSelector } from "reselect";

export const documentsGetter = (state) => state.documents.entities;
export const filtersGetter = (state) => state.filters;

export const filteredDocumentsSelector = createSelector(documentsGetter, filtersGetter, (documents, filters) => {
  const { dateFrom, dateTo, filename, sizeFrom, sizeTo } = filters.documents;

  return documents.filter((document: any) => {
    return document.fullpath.match(filename) &&
      (dateFrom ? (new Date(document.mtime)).getTime() >= (new Date(dateFrom)).getTime() : true) &&
      (dateTo ? (new Date(document.mtime)).getTime() <= (new Date(dateTo.setHours(23, 59, 59, 999))).getTime() : true)
  });
});
