import { useSiwe } from "ic-siwe-js/react";
import { useState } from "react";
import { useAccount } from "wagmi";

import { useQuery } from "@tanstack/react-query";
import { DateToBigIntTimestamp } from "@zk-game-dao/ui";

export const useSiweLoginFlow = () => {
  const {
    prepareLogin,
    isPrepareLoginIdle,
    login,
    clear,
    identity,
    identityAddress,
  } = useSiwe();

  const { address, isConnected } = useAccount();
  const [manuallyTriggered, setManuallyTriggered] = useState(false);

  const prepareQuery = useQuery({
    queryKey: ["prepare-login", address],
    queryFn: async () => {
      if (!address) throw new Error("No address available");
      await prepareLogin();
      return true;
    },
    enabled: !!address && isPrepareLoginIdle,
    staleTime: Infinity,
    retry: false,
  });

  const loginQuery = useQuery({
    queryKey: [
      "perform-login",
      address,
      identity?.getPrincipal().toText(),
      manuallyTriggered,
    ],
    queryFn: async () => {
      if (!isConnected || identity || !manuallyTriggered) return;
      await login();
      return true;
    },
    enabled: !!isConnected && !!address && !identity && manuallyTriggered,
    staleTime: Infinity,
    retry: false,
  });

  useQuery({
    queryKey: ["clear-login", identity?.getPrincipal().toText()],
    queryFn: async () => {
      if (!identity) return;
      if (
        !identity
          .getDelegation()
          .delegations.every(
            (d) => d.delegation.expiration >= DateToBigIntTimestamp(new Date())
          )
      ) {
        await clear();
      }
    },
    enabled: !!identity,
    staleTime: Infinity,
    retry: false,
  });

  return {
    prepareQuery,
    loginQuery,
    manuallyTrigger: () => setManuallyTriggered(true),
  };
};
