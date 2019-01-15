export interface IMegafonSettings {
  mobileNumber: string;
}

export interface ICryptoProSettings {
  authURL: string;
  restURL: string;
}

export interface IService {
  id: string;
  type: "MEGAFON" | "CRYPTOPRO_DSS";
  settings: IMegafonSettings & ICryptoProSettings;
  name: string;
}
