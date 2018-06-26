import { LOAD_ALL_DOCUMENTS, REMOVE_ALL_DOCUMENTS, START, SUCCESS } from "../constants";

interface IDocument {
  id: string;
  path: string;
  size: number;
}

export function loadAllDocuments() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_DOCUMENTS + START,
    });

    setTimeout(() => {
      const documents: IDocument[] = [];

      dispatch({
        payload: { documents },
        type: LOAD_ALL_DOCUMENTS + SUCCESS,
      });
    }, 0);
  };
}

export function removeAllDocuments() {
  return {
    type: REMOVE_ALL_DOCUMENTS,
  };
}
