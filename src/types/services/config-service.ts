export type InitConfigOptions = Partial<{
  fileName: string;
  override: boolean;
  setInProcessEnv: boolean;
}>;

export type ConfigData = Partial<{
  accessToken: string;
  tokenCommand: string;
  defaultTokenName: string;
}>;
