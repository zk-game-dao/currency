import type { Meta, StoryObj } from '@storybook/react';

import { CurrencyComponent } from '../currency.component';

const meta: Meta<typeof CurrencyComponent> = {
  title: 'UI/Currency',
  component: CurrencyComponent,
  args: {
    currencyType: { Fake: null },
    currencyValue: 10000000n,
  }
};

export default meta;
type Story = StoryObj<typeof CurrencyComponent>;

export const Fake: Story = { args: { currencyType: { Fake: null } } };
export const ICP: Story = { args: { currencyType: { Real: { ICP: null } } } };
export const BTCSats: Story = {
  args: {
    currencyValue: 10000n,
    currencyType: {
      Real: { BTC: null }
    }
  }
};
export const BTCSatsLoads: Story = {
  args: {
    currencyValue: 11111111n,
    currencyType: {
      Real: { BTC: null }
    }
  }
};
export const BTC: Story = {
  args: {
    currencyValue: 1000000n,
    currencyType: {
      Real: { BTC: null }
    }
  }
};
export const ETH: Story = { args: { currencyType: { Real: { CKETHToken: { ETH: null } } }, currencyValue: 1000000000000n, } };
export const USDT: Story = { args: { currencyType: { Real: { CKETHToken: { USDT: null } } } } };
export const USDC: Story = { args: { currencyType: { Real: { CKETHToken: { USDC: null } } } } };
