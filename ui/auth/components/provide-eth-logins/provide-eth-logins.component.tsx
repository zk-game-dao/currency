import { SiweIdentityProvider, useSiwe } from 'ic-siwe-js/react';
import { createContext, memo, PropsWithChildren, useContext, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';

import { DelegationIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { UseMutationResult } from '@tanstack/react-query';
import { IsDev, useMutation, useToast } from '@zk-game-dao/ui';

import { useIsBTC } from '../../../context';
import { useSiweLoginFlow } from './use-eth-login-flow.hook';
import { wagmiConfig } from './wagmi.config';

type SIWEContextType = {
  identity?: DelegationIdentity;
  clear(): void;
  signInMutation: UseMutationResult<void, Error, void, unknown>;
  loading: boolean;
  error?: unknown;
};

const SIWEContext = createContext<SIWEContextType>({
  loading: false,
  clear: () => { },
  signInMutation: {} as UseMutationResult<void, Error, void, unknown>,
});

const RequiredSiweLoginsProvider = memo<PropsWithChildren<{}>>(({ children }) => {
  const { addToast } = useToast();
  const { prepareQuery, loginQuery, manuallyTrigger } = useSiweLoginFlow();

  const { clear, identity } = useSiwe();

  const signInMutation = useMutation({
    mutationFn: async () => {
      manuallyTrigger();
    },
  });

  useEffect(() => {
    if (loginQuery.isSuccess) {
      addToast({ children: 'Connected to your wallet' });
    }
  }, [loginQuery.isSuccess]);

  return (
    <SIWEContext.Provider
      value={{
        identity,
        clear,
        signInMutation,
        loading: prepareQuery.isLoading || loginQuery.isLoading,
        error: prepareQuery.error || loginQuery.error,
      }}
    >
      {children}
    </SIWEContext.Provider>
  );
});

export const ProvideSiweLogins = memo<PropsWithChildren<{
  siweProviderCanisterId: Principal;
}>>(({ children, siweProviderCanisterId }) => {
  const isBTC = useIsBTC();
  return (
    <WagmiProvider config={wagmiConfig}>
      <SiweIdentityProvider
        canisterId={siweProviderCanisterId.toText()}
        httpAgentOptions={{
          host: !IsDev ? 'https://icp0.io' : 'http://127.0.0.1:4943',
        }}
      >
        {isBTC ? <>{children}</> :
          (
            <RequiredSiweLoginsProvider>
              {children}
            </RequiredSiweLoginsProvider>
          )}
      </SiweIdentityProvider>
    </WagmiProvider>
  );
},
  (prevProps, nextProps) =>
    prevProps.siweProviderCanisterId.compareTo(nextProps.siweProviderCanisterId) === 'eq' &&
    prevProps.children === nextProps.children
);

export const useSiweLogins = () => useContext(SIWEContext);
