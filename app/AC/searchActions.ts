import { CHANGE_SEARCH_VALUE } from "../constants";

export function changeSearchValue(searchValue: string) {
  return {
    payload: { searchValue },
    type: CHANGE_SEARCH_VALUE,
  };
}
