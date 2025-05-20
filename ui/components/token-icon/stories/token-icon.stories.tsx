import type { Meta, StoryObj } from '@storybook/react';

import { CurrencyTypeIconComponent } from '../token-icon.component';

const meta: Meta<typeof CurrencyTypeIconComponent> = {
  title: 'UI/Icons/Token',
  component: CurrencyTypeIconComponent,
  args: {
    currencyType: { Fake: null },
    className: 'size-5',
  }
};

export default meta;
type Story = StoryObj<typeof CurrencyTypeIconComponent>;

export const Fake: Story = { args: { currencyType: { Fake: null } } };
export const ICP: Story = { args: { currencyType: { Real: { ICP: null } } } };
export const BTC: Story = { args: { currencyType: { Real: { BTC: null } } } };
export const ETH: Story = { args: { currencyType: { Real: { CKETHToken: { ETH: null } } } } };
export const USDT: Story = { args: { currencyType: { Real: { CKETHToken: { USDT: null } } } } };
export const USDC: Story = { args: { currencyType: { Real: { CKETHToken: { USDC: null } } } } };
