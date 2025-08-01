import { memo, useMemo, useState } from 'react';

import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import { WalletIcon } from '@solana/wallet-adapter-react-ui';
import { useSiws } from "ic-siws-js/react";
import {
  ButtonComponent,
  ErrorComponent, FormComponent, Image, Interactable, List, ListItem, LoadingAnimationComponent, Modal, TitleTextComponent,
  useMutation
} from '@zk-game-dao/ui';

import { NetworkGuardComponent } from '../../../components/network-guard/network-guard.component';
import { useIsSOL } from '../../../context';
import { SocialLoginProviders, useAuth, Web3AuthLoginProvider } from '../../types';
import {
  LoginProviderListItemComponent
} from '../login-provider/login-provider-list-item.component';
import { SWIBLogins } from './swib-logins.component';
import classNames from 'classnames';

const SocialsComponent = memo<{
  onClose(): void;
  isLoggingIn: boolean;
  loginFactory(loginProvider: Web3AuthLoginProvider): () => Promise<void>;
}>(({ onClose, isLoggingIn, loginFactory }) => {
  const [isShowingMore, setShowingMore] = useState(false);

  const [email, setEmail] = useState<string | undefined>();
  const { wallets: walletsFromSystem, wallet: currentWallet, select, ...asdf } = useWallet();
  const { login, loginStatus, identity, clear, ...asdff } = useSiws();
  const isSOL = useIsSOL();
  // Some wallets don't work with siws yet
  const wallets = useMemo(() => walletsFromSystem
    .filter((wallet) => wallet.adapter.name !== 'Solflare'), [walletsFromSystem]);
  const hasSomeConnectedWallets = useMemo(
    () => wallets.some((wallet) => wallet.adapter.connected),
    [wallets],
  );

  const loginToSolanaMut = useMutation({
    mutationFn: async (wallet: Wallet) => {
      if (!wallet)
        throw new Error("No wallet selected");

      await wallet.adapter.connect();
      await login();
    },
    onSuccess: onClose,
  })


  const shownLoginProviders = useMemo(
    () =>
      isShowingMore ? SocialLoginProviders : SocialLoginProviders.slice(0, 5),
    [isShowingMore],
  );

  return (
    <div className="gap-3 flex flex-col justify-center">

      {/* Email login */}
      <FormComponent
        fields={[{ label: "Email", type: "email", name: "email" }]}
        values={[email]}
        onChange={([email]) => setEmail(email as string)}
        onCancel={onClose}
        isLoading={isLoggingIn}
        onConfirm={loginFactory({
          type: "email_passwordless",
          email: email ?? "",
        })}
      />

      {!identity && currentWallet && (
        <ButtonComponent onClick={login}>
          Continue to {currentWallet.adapter.name}
        </ButtonComponent>
      )}

      <ErrorComponent error={loginToSolanaMut.error} />

      {isSOL && (
        <List label="Connect Wallet">
          {wallets.map((wallet) => (
            <ListItem
              key={wallet.adapter.name}
              onClick={() => loginToSolanaMut.mutateAsync(wallet)}
              icon={(
                <div className={classNames("w-6 ml-5 mr-4 relative", {
                  "opacity-50 pointer-events-none": wallet.readyState !== "Installed",
                })}>
                  {wallet.adapter.connected && <span className='bg-green-500 absolute top-0 -translate-1/3 left-0 size-2 rounded-full' />}
                  {wallet.readyState !== "Installed" && <span className='bg-red-500 absolute top-0 -translate-1/3 left-0 size-2 rounded-full' />}
                  <WalletIcon
                    wallet={wallet}
                    className={classNames({
                      "opacity-80 group-hover:opacity-100 transition-opacity": !wallet.adapter.connected && hasSomeConnectedWallets,
                    })}
                  />
                </div>
              )}
            >
              {(
                loginToSolanaMut.variables?.adapter.name === wallet.adapter.name &&
                loginToSolanaMut.isPending
              ) ? (
                <LoadingAnimationComponent variant="shimmer" className='ml-1'>Connecting to {wallet.adapter.name}</LoadingAnimationComponent>
              ) : (
                <span>{wallet.adapter.name}</span>
              )}

              {wallet.readyState !== "Installed" && (
                <span className="text-red-500 ml-2">Not installed</span>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <List label="Login with">
        {shownLoginProviders.map((loginProvider) => (
          <LoginProviderListItemComponent
            key={loginProvider}
            loginProvider={loginProvider}
            login={loginFactory({ type: loginProvider })}
          />
        ))}
      </List>

      {!isShowingMore && (
        <Interactable
          className="text-material-main-3 flex flex-row type-button-3 justify-center items-center"
          onClick={() => setShowingMore(!isShowingMore)}
        >
          Show more
          <Image
            src="/icons/chevron-down-white.svg"
            type="svg"
            className="w-2 opacity-30 ml-2"
            alt="Show more"
          />
        </Interactable>
      )}
    </div>
  );
});


export const SignupModalComponent = memo<{ onClose(): void }>(({ onClose }) => {
  const { loginFactory, error, isLoggingIn } = useAuth();

  return (
    <Modal open onClose={onClose}>
      <TitleTextComponent title="Sign in" text="Choose a method to sign in" />

      <NetworkGuardComponent network="btc">
        <SWIBLogins />
      </NetworkGuardComponent>

      <NetworkGuardComponent network="ic">
        <SocialsComponent
          onClose={onClose}
          isLoggingIn={!!isLoggingIn}
          loginFactory={loginFactory}
        />

        <ErrorComponent error={error} className="mb-4" />
      </NetworkGuardComponent>
    </Modal>
  );
});
