import type { Meta, StoryObj } from '@storybook/react-vite'

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
    children: { control: 'text' },
    small: { control: 'boolean' },
    round: { control: 'boolean' }
  },
  args: {
    children: 'Button',
    variant: 'default',
    small: false,
    round: false
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

export const Small: Story = {
  args: {
    children: 'Small',
    small: true
  }
}

export const Round: Story = {
  args: {
    children: '🔔',
    round: true,
    'aria-label': 'Icon Button'
  }
}

export const SmallPrimary: Story = {
  args: {
    children: 'Small Primary',
    variant: 'primary',
    small: true
  }
}

export const RoundPrimary: Story = {
  args: {
    children: '+',
    variant: 'primary',
    round: true,
    'aria-label': 'Add'
  }
}

export const SmallRound: Story = {
  args: {
    children: '★',
    small: true,
    round: true,
    'aria-label': 'Star'
  }
}

export const SmallRoundPrimary: Story = {
  args: {
    children: '✓',
    variant: 'primary',
    small: true,
    round: true,
    'aria-label': 'Check'
  }
}
