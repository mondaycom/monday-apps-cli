export type InitConfigOptions = Partial<{
  fileName: string;
  override: boolean;
  setInProcessEnv: boolean;
}>;

export type ConfigData = Partial<{
  accessToken: string;
  profiles: Record<string, string>;
  defaultProfile: string;
}>;
