import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../components/Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'default']
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' }
  },
  args: {
    children: 'Button',
    variant: 'default'
  }
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default'
  }
}

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary'
  }
}

export const Danger: Story = {
  args: {
    children: 'Danger',
    variant: 'danger'
  }
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
    variant: 'primary'
  }
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary'
  }
}
