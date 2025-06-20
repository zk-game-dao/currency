import { AnimatePresence } from 'framer-motion';
import { memo, useEffect, useMemo } from 'react';
import { Connector, useAccount, useConnect } from 'wagmi';

import { ErrorComponent, List, ListItem, LoadingAnimationComponent } from '@zk-game-dao/ui';

import WalletConnectIcon from './assets/WalletConnect-icon.svg';

const SIWEConnect = memo<{
  connector: Connector;
  isPending: boolean;
  isConnecting: boolean;
  connect(connector: Connector): void;
}>(({ connector, isPending, isConnecting, connect }) => {

  const icon = useMemo(() => {
    switch (connector.id) {
      case "walletConnect":
        return WalletConnectIcon;
      default:
        return connector.icon;
    }
  }, [connector.id, connector.icon]);

  return (
    <ListItem onClick={() => connect(connector)} icon={<div className="w-6 ml-5 mr-4"><img src={icon} /></div>}>
      {isConnecting ? (
        <LoadingAnimationComponent variant="shimmer">
          Connecting to {connector.name}
        </LoadingAnimationComponent>
      ) : (
        <>
          {connector.name}
        </>
      )}
    </ListItem>
  );
});

export const SIWELogins = memo(() => {
  const {
    connect,
    connectors,
    error: connectError,
    isPending,
    variables,
    reset,
  } = useConnect();

  const { isConnected, address } = useAccount();

  useEffect(() => {
    reset(); // resets on component open/mount
  }, [reset]);

  return (
    <AnimatePresence>
      {isConnected ? (
        <List>
          <ListItem rightLabel={`${address?.slice(0, 20)}...`}>
            Your wallet address
          </ListItem>
        </List>
      ) : (
        <>
          {connectError && (
            <ErrorComponent
              error={`Failed to connect to ${variables?.connector?.name || "wallet"
                }.`}
            />
          )}
          <List label="Connect to your wallet">
            {connectors.map((connector) => (
              <SIWEConnect
                key={connector.id}
                connector={connector}
                isPending={isPending}
                isConnecting={!!(
                  isPending &&
                  variables?.connector &&
                  'id' in variables?.connector &&
                  variables?.connector.id === connector.id
                )}
                connect={(connector) => connect({ connector })}
              />
            ))}
          </List>
        </>
      )}
    </AnimatePresence>
  );
});
