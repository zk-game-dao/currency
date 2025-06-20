import { memo, ReactNode } from 'react';

import { Principal } from '@dfinity/principal';

import {
  ProvideAuthClient
} from '../auth/components/provide-auth-client/provide-auth-client.component';
import {
  ProvideSiwbLogins
} from '../auth/components/provide-btc-logins/provide-btc-logins.component';
import {
  ProvideSiweLogins
} from '../auth/components/provide-eth-logins/provide-eth-logins.component';
import { CurrencyNetwork } from '../types';
import { IC_SIWB_ID } from '../utils/env';
import { AllowanceManagementProvider } from './allowance.context';
import { ProvideBTC } from './btc-context.context';
import { ProvideChainFusionContext } from './chain-fusion-provider';
import { ProvideCurrencyConfig } from './currency-config.context';
import { EI6963Provider } from './EIP6963-provider';
import { ProvideManualWalletContext } from './manual-wallet-provider';
import { ProvideTokenRegistry } from './token-registry.context';

export const ProvideCurrencyContext = memo<{
  children: ReactNode;
  disabledNetworks?: CurrencyNetwork[];
  enabledNetworks?: CurrencyNetwork[];
  /** If left empty its going to use the production canister */
  siwbProviderCanisterId?: Principal;
  siweProviderCanisterId?: Principal;
}>(({
  children,
  disabledNetworks,
  enabledNetworks,
  siwbProviderCanisterId = IC_SIWB_ID
}) => (
  <ProvideCurrencyConfig
    disabledNetworks={disabledNetworks}
    enabledNetworks={enabledNetworks}
  >
    <ProvideTokenRegistry>
      <ProvideSiwbLogins siwbProviderCanisterId={siwbProviderCanisterId}>
        <ProvideSiweLogins siweProviderCanisterId={siwbProviderCanisterId}>
          <ProvideAuthClient>
            <EI6963Provider>
              <ProvideManualWalletContext>
                <ProvideChainFusionContext>
                  <AllowanceManagementProvider>
                    <ProvideBTC>
                      {children}
                    </ProvideBTC>
                  </AllowanceManagementProvider>
                </ProvideChainFusionContext>
              </ProvideManualWalletContext>
            </EI6963Provider>
          </ProvideAuthClient>
        </ProvideSiweLogins>
      </ProvideSiwbLogins>
    </ProvideTokenRegistry>
  </ProvideCurrencyConfig>

));
