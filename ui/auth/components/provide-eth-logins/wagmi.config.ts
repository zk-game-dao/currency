import { createConfig, http, type Config } from "wagmi";

import { mainnet } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

const WALLETCONNECT_PROJECT_ID =
  process.env.VITE_WALLETCONNECT_PROJECT_ID ??
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!WALLETCONNECT_PROJECT_ID)
  throw new Error("WALLETCONNECT_PROJECT_ID is not defined");

export const wagmiConfig: Config = createConfig({
  chains: [mainnet],
  connectors: [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })],
  transports: {
    [mainnet.id]: http(),
  },
});
