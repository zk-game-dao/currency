import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { UserError } from "@zk-game-dao/ui";

import { AuthData } from "../auth";
import { CurrencyReceiver, CurrencyType } from "../types/currency";
import { getLedgerCanisterID } from "./manager";

export const transferTo = async (
  currencyType: CurrencyType,
  receiver: CurrencyReceiver,
  amount: bigint,
  authData: AuthData
) => {
  if (!("principal" in receiver))
    throw new UserError("Account identifier not supported");

  if ("Fake" in currencyType) return 0n;

  const canisterId = getLedgerCanisterID(currencyType.Real);

  if ("ICP" in currencyType.Real) {
    const canisterId = getLedgerCanisterID(currencyType.Real);

    return LedgerCanister.create({
      agent: authData.agent,
      canisterId,
    }).transfer({
      to: AccountIdentifier.fromPrincipal({
        principal: receiver.principal,
      }),
      amount,
    });
  }

  const ledgerCanister = IcrcLedgerCanister.create({
    agent: authData.agent,
    canisterId,
  });

  return ledgerCanister.transfer({
    to: {
      owner: receiver.principal,
      subaccount: [],
    },
    amount,
  });
};
