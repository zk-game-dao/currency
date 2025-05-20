export const CURRENCY_NETWORKS = ["ic", "btc", "eth"] as const;
export type CurrencyNetwork = (typeof CURRENCY_NETWORKS)[number];

export type CurrencyConfigContextType = {
  enabledNetworks: CurrencyNetwork[];
};
