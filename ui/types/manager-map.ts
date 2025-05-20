import { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import {
  IcrcLedgerCanister,
  IcrcTokenMetadata,
  mapTokenMetadata,
} from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { IsDev, matchRustEnum } from "@zk-game-dao/ui";
import BTCToken from "../icons/tokens/bitcoin-symbol.svg";
import SatoshisToken from "../icons/tokens/satoshi.svg";
import ETHToken from "../icons/tokens/eth.svg";
import ICPToken from "../icons/tokens/icp.svg";
import USDTToken from "../icons/tokens/tether.svg";
import USDCToken from "../icons/tokens/usdc.svg";
import FakePP from "../icons/tokens/fake-pp.png";
import FakeZKP from "../icons/tokens/fake-zkp.png";

import { host } from "../auth";
import { CurrencyToString } from "../utils/currency-type-to-string";
import { BTC_LEDGER_CANISTER_ID } from "./chain-fusion.context";
import { CKTokenSymbol, Currency, CurrencyType } from "./currency";
import { CurrencyManager } from "./manager";
import { CurrencyMeta } from "./meta";
import { useIsBTC } from "../context";
import { decodeSymbolFrom8Bytes } from "../utils/encode-symbol";

/** The string value is the serialized string of the currency type */
export type CurrencyManagerMap = Record<string, CurrencyManager>;

export const getCKTokenLedgerCanisterID = (
  ckTokenSymbol: CKTokenSymbol
): Principal =>
  Principal.fromText(
    matchRustEnum(ckTokenSymbol)({
      ETH: () => "ss2fx-dyaaa-aaaar-qacoq-cai",
      USDC: () => "xevnm-gaaaa-aaaar-qafnq-cai",
      USDT: () => "cngnf-vqaaa-aaaar-qag4q-cai",
      BTC: () => BTC_LEDGER_CANISTER_ID,
    })
  );

export const getLedgerCanisterID = (currency: Currency): Principal =>
  matchRustEnum(currency)({
    ICP: () => Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    GenericICRC1: (token) => token.ledger_id,
    CKETHToken: (ckTokenSymbol) => getCKTokenLedgerCanisterID(ckTokenSymbol),
    BTC: () => Principal.fromText(BTC_LEDGER_CANISTER_ID),
  });

const buildBTCStaticMetadata = (
  metadata?: IcrcTokenMetadata
): CurrencyMeta => ({
  decimals: metadata?.decimals ?? 8,
  thousands: 10 ** (metadata?.decimals ?? 8),
  transactionFee: metadata?.fee ?? 10_000n,
  renderedDecimalPlaces: 6,
  metadata: undefined,
  icon: BTCToken,
  symbol: "BTC",
  alternatives: {
    satoshis: {
      decimals: 0,
      thousands: 1,
      transactionFee: metadata?.fee ?? 10_000n,
      metadata: undefined,
      icon: SatoshisToken,
      symbol: "sats",
    },
  },
});

/** All the static metadata info that can be extracted */
export const getStaticManagerMetadata = (
  currency: Currency,
  metadata?: IcrcTokenMetadata
): CurrencyMeta =>
  matchRustEnum(currency)({
    ICP: (): CurrencyMeta => ({
      decimals: metadata?.decimals ?? 8,
      thousands: 10 ** (metadata?.decimals ?? 8),
      transactionFee: metadata?.fee ?? 10_000n,
      metadata,
      renderedDecimalPlaces: 4,
      icon: ICPToken,
      symbol: "ICP",
    }),
    GenericICRC1: (token): CurrencyMeta => ({
      metadata,
      decimals: token.decimals,
      thousands: 10 ** token.decimals,
      transactionFee: metadata?.fee ?? 10_000n,
      icon: metadata?.icon,
      symbol: decodeSymbolFrom8Bytes(token.symbol),
    }),
    CKETHToken: (ckTokenSymbol) =>
      matchRustEnum(ckTokenSymbol)({
        ETH: () => ({
          decimals: metadata?.decimals ?? 18,
          thousands: 10 ** (metadata?.decimals ?? 18),
          transactionFee: metadata?.fee ?? 10_000n,
          renderedDecimalPlaces: 6,
          metadata,
          icon: ETHToken,
          symbol: "ETH",
        }),
        USDC: () => ({
          decimals: metadata?.decimals ?? 6,
          thousands: 10 ** (metadata?.decimals ?? 6),
          transactionFee: metadata?.fee ?? 10_000n,
          renderedDecimalPlaces: 2,
          metadata,
          icon: USDCToken,
          symbol: "USDC",
        }),
        USDT: () => ({
          decimals: metadata?.decimals ?? 6,
          thousands: 10 ** (metadata?.decimals ?? 6),
          transactionFee: metadata?.fee ?? 10_000n,
          renderedDecimalPlaces: 2,
          metadata,
          icon: USDTToken,
          symbol: "USDT",
        }),
        BTC: () => buildBTCStaticMetadata(metadata),
      }),
    BTC: () => buildBTCStaticMetadata(metadata),
  });

export const getManagerMetadata = async (
  currency: Currency,
  agent = HttpAgent.createSync({
    host,
  })
): Promise<CurrencyMeta> => {
  if (IsDev) await agent.fetchRootKey();

  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: getLedgerCanisterID(currency),
  });

  const meta = await ledger.metadata({});
  const metadata = mapTokenMetadata(meta);

  if (!metadata)
    throw new Error(`Metadata not found for ${CurrencyToString(currency)}`);

  return getStaticManagerMetadata(currency, {
    ...metadata,
    fee: (await ledger.transactionFee({})) ?? metadata.fee,
  });
};

export const buildICRC1CurrencyManager = async (
  agent: HttpAgent,
  currency: Currency
): Promise<CurrencyManager> => {
  return {
    currencyType: { Real: currency },
    meta: await getManagerMetadata(currency, agent),
  };
};

export const buildCKTokenManager = async (
  agent: HttpAgent,
  ckTokenSymbol: CKTokenSymbol
): Promise<CurrencyManager> =>
  buildICRC1CurrencyManager(agent, {
    CKETHToken: ckTokenSymbol,
  });

export const buildICPManager = async (
  agent: HttpAgent
): Promise<CurrencyManager> => {
  if (IsDev) await agent.fetchRootKey();

  const ledger = LedgerCanister.create({
    agent,
    canisterId: getLedgerCanisterID({ ICP: null }),
  });
  const meta = await ledger.metadata({});
  const metadata = mapTokenMetadata(meta);

  if (!metadata) throw new Error(`Metadata not found for ICP`);

  return {
    currencyType: { Real: { ICP: null } },
    meta: {
      decimals: metadata.decimals,
      thousands: 10 ** metadata.decimals,
      transactionFee: 10_000n,
      metadata,
      icon: ICPToken,
      symbol: "ICP",
    },
  };
};

export const buildCurrencyManager = async (
  agent: HttpAgent,
  currency: Currency
): Promise<CurrencyManager> =>
  matchRustEnum(currency)({
    ICP: (): Promise<CurrencyManager> => buildICPManager(agent),
    GenericICRC1: async (token): Promise<CurrencyManager> =>
      buildICRC1CurrencyManager(agent, currency),
    CKETHToken: async (ckTokenSymbol): Promise<CurrencyManager> =>
      buildCKTokenManager(agent, ckTokenSymbol),
    BTC: async (): Promise<CurrencyManager> =>
      buildICRC1CurrencyManager(agent, { BTC: null }),
  });

export const buildFakeCurrencyManager = (isBTC: boolean): CurrencyManager => ({
  currencyType: { Fake: null },
  meta: {
    decimals: 8,
    thousands: 10 ** 8,
    transactionFee: 10_000n,
    icon: isBTC ? FakePP : FakeZKP,
    symbol: "IN-GAME",
  },
});

export const buildCurrencyTypeManager = async (
  agent: HttpAgent,
  currencyType: CurrencyType
): Promise<CurrencyManager> => {
  const isBTC = useIsBTC();
  return matchRustEnum(currencyType)({
    Fake: async (): Promise<CurrencyManager> => buildFakeCurrencyManager(isBTC),
    Real: (currency) => buildCurrencyManager(agent, currency),
  });
};
