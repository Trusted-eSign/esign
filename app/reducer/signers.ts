import { SELECT_SIGNER_CERTIFICATE } from "../constants";

const defaultSigners = {
    signer: "",
};

export default (signers = defaultSigners, action) => {
    const { type, payload } = action;

    switch (type) {
        case SELECT_SIGNER_CERTIFICATE:
            return {...signers, signer: payload.selected};
    }

    return signers;
};
