interface IMegafonSettings {
  mobileNumber: string;
}

export interface IService {
  id: string;
  type: "MEGAFON";
  settings?: IMegafonSettings;
  name: string;
}
