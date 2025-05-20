import { Principal } from "@dfinity/principal";

import { CurrencyReceiver, CurrencyType } from "./currency";
import { CurrencyMeta } from "./meta";

export type CurrencyManager = {
  // wallet?: {
  //   self: CurrencyReceiver;
  //   address: Principal;
  //   accountBalance(): Promise<bigint>;
  //   transferTo(to: CurrencyReceiver, amount: bigint): Promise<bigint>;
  // };
  meta: CurrencyMeta;
  currencyType: CurrencyType;
};
