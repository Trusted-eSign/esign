import { createSelector } from "reselect";
import {
  ALL, ENCRYPTED, SIGNED,
} from "../constants";

export const documentsGetter = (state) => state.documents.entities;
export const filtersGetter = (state) => state.filters;

export const filteredDocumentsSelector = createSelector(documentsGetter, filtersGetter, (documents, filters) => {
  const { dateFrom, dateTo, filename, sizeFrom, sizeTo, types } = filters.documents;

  return documents.filter((document: any) => {
    return document.fullpath.match(filename) &&
      (sizeFrom ? document.filesize >= sizeFrom : true) &&
      (sizeTo ? document.filesize <= sizeTo : true) &&
      (dateFrom ? (new Date(document.mtime)).getTime() >= (new Date(dateFrom)).getTime() : true) &&
      (dateTo ? (new Date(document.mtime)).getTime() <= (new Date(dateTo.setHours(23, 59, 59, 999))).getTime() : true) &&
      (
        types[ENCRYPTED] && document.extname === ".enc" ||
        types[SIGNED] && document.extname === ".sig" ||
        (
          !types[ENCRYPTED] && !types[SIGNED]
        )
      );
  });
});
