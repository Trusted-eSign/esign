import { CHANGE_SEARCH_VALUE } from "../constants";

const defaultFilters = {
    searchValue: "",
};

export default (filters = defaultFilters, action) => {
    const { type, payload } = action;

    switch (type) {
        case CHANGE_SEARCH_VALUE:
            return {...filters, searchValue: payload.searchValue};
    }

    return filters;
};
