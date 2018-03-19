import { REMOVE_ALL_CERTIFICATES, SELECT_SIGNER_CERTIFICATE } from "../constants";

const defaultSigners = {
    signer: "",
};

export default (signers = defaultSigners, action) => {
    const { type, payload } = action;

    switch (type) {
        case SELECT_SIGNER_CERTIFICATE:
            return {...signers, signer: payload.selected};
        case REMOVE_ALL_CERTIFICATES:
            return signers = defaultSigners;
    }

    return signers;
};
