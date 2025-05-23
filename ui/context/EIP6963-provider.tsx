import { memo, PropsWithChildren, useCallback, useEffect, useState } from 'react';

import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderContext,
  EIP6963ProviderDetail,
  WalletError,
} from '../types/EIP6963.context';

// Type alias for a record where the keys are wallet identifiers and the values are account
// addresses or null.
type SelectedAccountByWallet = Record<string, string | null>;

// The WalletProvider component wraps all other components in the dapp, providing them with the
// necessary data and functions related to wallets.
export const EI6963Provider = memo<PropsWithChildren>(({ children }) => {
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({})
  const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(null)
  const [selectedAccountByWalletRdns, setSelectedAccountByWalletRdns] = useState<SelectedAccountByWallet>({})

  const [errorMessage, setErrorMessage] = useState("")
  const clearError = () => setErrorMessage("")
  const setError = (error: string) => setErrorMessage(error)

  useEffect(() => {
    const savedSelectedWalletRdns = localStorage.getItem("selectedWalletRdns")
    const savedSelectedAccountByWalletRdns = localStorage.getItem("selectedAccountByWalletRdns")

    if (savedSelectedAccountByWalletRdns) {
      setSelectedAccountByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns))
    }

    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      setWallets(currentWallets => ({
        ...currentWallets,
        [event.detail.info.rdns]: event.detail
      }))

      if (savedSelectedWalletRdns && event.detail.info.rdns === savedSelectedWalletRdns) {
        setSelectedWalletRdns(savedSelectedWalletRdns)
      }
    }

    window.addEventListener("eip6963:announceProvider", onAnnouncement)
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    return () => window.removeEventListener("eip6963:announceProvider", onAnnouncement)
  }, []);

  const connectWallet = useCallback(
    async (walletRdns: string) => {
      try {
        const wallet = wallets[walletRdns]
        const accounts = (await wallet.provider.request({
          method: "eth_requestAccounts",
        })) as string[]

        if (accounts?.[0]) {
          setSelectedWalletRdns(wallet.info.rdns)
          setSelectedAccountByWalletRdns((currentAccounts) => ({
            ...currentAccounts,
            [wallet.info.rdns]: accounts[0],
          }))

          localStorage.setItem("selectedWalletRdns", wallet.info.rdns)
          localStorage.setItem(
            "selectedAccountByWalletRdns",
            JSON.stringify({
              ...selectedAccountByWalletRdns,
              [wallet.info.rdns]: accounts[0],
            })
          )
        }
      } catch (error) {
        console.error("Failed to connect to provider:", error)
        const walletError: WalletError = error as WalletError
        setError(
          `Code: ${walletError.code} \nError Message: ${walletError.message}`
        )
      }
    },
    [wallets, selectedAccountByWalletRdns]
  );

  const disconnectWallet = useCallback(async () => {
    if (selectedWalletRdns) {
      setSelectedAccountByWalletRdns((currentAccounts) => ({
        ...currentAccounts,
        [selectedWalletRdns]: null,
      }))

      const wallet = wallets[selectedWalletRdns]
      setSelectedWalletRdns(null)
      localStorage.removeItem("selectedWalletRdns")

      try {
        await wallet.provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        })
      } catch (error) {
        console.error("Failed to revoke permissions:", error)
      }
    }
  }, [selectedWalletRdns, wallets]);

  return (
    <EIP6963ProviderContext.Provider
      value={{
        wallets,
        selectedWallet:
          selectedWalletRdns === null ? null : wallets[selectedWalletRdns],
        selectedAccount:
          selectedWalletRdns === null
            ? null
            : selectedAccountByWalletRdns[selectedWalletRdns],
        errorMessage,
        connectWallet,
        disconnectWallet,
        clearError,
      }}
    >
      {children}
    </EIP6963ProviderContext.Provider>
  )


});