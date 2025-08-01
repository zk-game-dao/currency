import '@solana/wallet-adapter-react-ui/styles.css';

import { SiwsIdentityProvider, useSiws } from 'ic-siws-js/react';
import { memo, PropsWithChildren } from 'react';

import { Principal } from '@dfinity/principal';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

type Props = PropsWithChildren<{
  siwsProvidedCanisterId: Principal;
}>;

const InnerProvider = memo<PropsWithChildren<PropsWithChildren>>(({ children }) => {
  const { login, loginStatus, identity, clear } = useSiws();
  const { wallet } = useWallet();

  const loginQuery = useQuery({
    queryKey: [
      "perform-login-siws",
      identity?.getPrincipal().toText(),
      wallet?.adapter.name,
    ],
    queryFn: async () => {
      console.log('loginStatus', loginStatus);
      if (!wallet || identity) return;
      await login();
      return true;
    },
    enabled: !!wallet && !identity,
    staleTime: Infinity,
    retry: false,
  });

  return children;
});

const ProvideSiws = memo<Props>(({ children, siwsProvidedCanisterId }) => {
  // Listen for changes to the selected wallet
  const { wallet } = useWallet();

  // Update the SiwsIdentityProvider with the selected wallet adapter
  return (
    <SiwsIdentityProvider
      canisterId={siwsProvidedCanisterId.toText()}
      adapter={wallet?.adapter}
      httpAgentOptions={{
        host: 'http://127.0.0.1:4943/'
      }}
    >
      <InnerProvider>
        {children}
      </InnerProvider>
    </SiwsIdentityProvider>
  );
});
ProvideSiws.displayName = "ProvideSiws";

export const ProvideSolanaLogins = memo<Props>((props) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  const wallets: Adapter[] = [];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ProvideSiws {...props} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
});
ProvideSolanaLogins.displayName = "ProvideSolanaLogins";
