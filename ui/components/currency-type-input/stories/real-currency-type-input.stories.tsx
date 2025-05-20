import type { Meta, StoryObj } from '@storybook/react';

import { RealCurrencyInputComponent } from '../currency-type-input.component';
import { List, ListItem } from '@zk-game-dao/ui';

const meta: Meta<typeof RealCurrencyInputComponent> = {
  title: 'UI/Inputs/RealCurrencyType',
  component: RealCurrencyInputComponent,
  args: {
    label: 'Hello world',
    onChange: (value) => console.log('onChange', value),
  }
};

export default meta;
type Story = StoryObj<typeof RealCurrencyInputComponent>;

export const Default: Story = {};
export const NoLabel: Story = { args: { label: undefined } };
export const WithSelection: Story = { args: { value: { ICP: null } } };
export const InList: Story = {
  decorators: [
    (Story) => (
      <List>
        <ListItem>ASDF</ListItem>
        <Story />
        <ListItem>BSDF</ListItem>
      </List>
    ),
  ],
}
export const InListWithSelection: Story = {
  args: { value: { ICP: null } },
  decorators: [
    (Story) => (
      <List>
        <ListItem>ASDF</ListItem>
        <Story />
        <ListItem>BSDF</ListItem>
      </List>
    ),
  ],
}
