import { AuthDataProvider } from "./auth-data";

export type AuthDataSiwe = AuthDataProvider<
  "siwe",
  { type: "siwe"; connectorId?: string }
>;
