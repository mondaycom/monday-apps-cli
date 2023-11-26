export type InitConfigOptions = Partial<{
  fileName: string;
  override: boolean;
  setInProcessEnv: boolean;
}>;

export type ConfigData = Partial<{
  accessToken: string;
  serverSidePath: string;
  clientSidePath: string;
}>;
