import * as React from "react";

interface ILicenseInfoField {
  title: string;
  info: string;
  style?: object;
  styleRow?: object;
}

export default function LicenseInfoField({ title, info, style, styleRow }: ILicenseInfoField) {
  return (
    <div className="col s6" style={styleRow}>
      <div className="desktoplic_text_item topitem" style={style}>{info}</div>
      <div className="desktoplic_text_item bottomitem">{title}</div>
    </div>
  );
}
