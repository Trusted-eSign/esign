import React from "react";

interface ILicenseInfoField {
  title: string;
  info: string;
}

export default function LicenseInfoField({ title, info }: ILicenseInfoField) {
    return (
      <React.Fragment>
        <div className="desktoplic_text_item bottomitem">{title}</div>
        <div className="desktoplic_text_item topitem">{info}</div>
      </React.Fragment>
    );
}
