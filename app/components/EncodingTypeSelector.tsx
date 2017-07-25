import * as React from "react";
import { lang } from "../module/global_app";

interface IEncodingTypeSelectorProps {
    EncodingValue: string;
}

class EncodingTypeSelector extends React.Component<IEncodingTypeSelectorProps, any> {
    constructor(props: IEncodingTypeSelectorProps) {
        super(props);
    }
    render() {
        return <div className="row settings-item">
            <div className="col sign-set-encoding">{lang.get_resource.Settings.encoding}</div>
            <div className="col input-field">
                <select id="encoding" defaultValue={this.props.EncodingValue}>
                    <option value={lang.get_resource.Settings.BASE}>{lang.get_resource.Settings.BASE}</option>
                    <option value={lang.get_resource.Settings.DER}>{lang.get_resource.Settings.DER}</option>
                </select>
            </div>
        </div>;
    }
}

export default EncodingTypeSelector;
