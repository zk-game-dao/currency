import { createContext, memo, PropsWithChildren, useContext, useMemo } from 'react';

import { CURRENCY_NETWORKS, CurrencyConfigContextType, CurrencyNetwork } from '../types/currency-config.context';

const CurrencyConfigContext = createContext<CurrencyConfigContextType>({ enabledNetworks: [] });

export const ProvideCurrencyConfig = memo<PropsWithChildren<{ enabledNetworks?: CurrencyNetwork[]; disabledNetworks?: CurrencyNetwork[] }>>(
  ({ children, enabledNetworks: _enabledNetworks, disabledNetworks }) => {

    const enabledNetworks = useMemo((): CurrencyNetwork[] => {
      let networks: CurrencyNetwork[] = [...(_enabledNetworks || [...CURRENCY_NETWORKS])];
      if (!disabledNetworks) return networks;
      return networks.filter(network => disabledNetworks.findIndex(disabledNetwork => disabledNetwork === network) === -1);
    }, [_enabledNetworks, disabledNetworks]);

    return (
      <CurrencyConfigContext.Provider value={{ enabledNetworks }}>
        {children}
      </CurrencyConfigContext.Provider>
    )
  });

export const useCurrencyConfig = () => useContext(CurrencyConfigContext);

export const useEnabledNetworks = () => {
  const ctx = useCurrencyConfig();
  return useMemo(() => ctx.enabledNetworks, [ctx.enabledNetworks]);
};

// This is a temporary solution
export const useIsBTC = () => {
  const enabledNetworks = useEnabledNetworks();
  return useMemo(() => enabledNetworks.length === 1 && enabledNetworks.includes('btc'), [enabledNetworks]);
};
