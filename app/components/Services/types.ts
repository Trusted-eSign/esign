export interface IMegafonSettings {
  mobileNumber: string;
}

export interface ICryptoProSettings {
  authURL: string;
  restURL: string;
}

export interface ICryptoProSVSSettings {
  hostName: string;
  applicationName: string;
}

export interface IService {
  id: string;
  type: "MEGAFON" | "CRYPTOPRO_DSS" | "CRYPTOPRO_SVS";
  settings: IMegafonSettings & ICryptoProSettings & ICryptoProSVSSettings;
  name: string;
}
