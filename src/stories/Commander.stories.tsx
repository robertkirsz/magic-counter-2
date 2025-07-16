import type { Meta, StoryObj } from '@storybook/react'

import { Commander } from '../components/Commander'

const meta: Meta<typeof Commander> = {
  title: 'Components/Commander',
  component: Commander,
  tags: ['autodocs'],
  args: {
    commander: {
      id: '1',
      name: 'Prossh, Skyraider of Kher',
      type: 'Legendary Creature — Dragon',
      colors: ['B', 'G', 'R'],
      image: 'https://cards.scryfall.io/art_crop/front/8/8/889c1a0f-7df2-4497-8058-04358173d7e8.jpg?1562438016'
    }
  }
}
export default meta

type Story = StoryObj<typeof Commander>

export const Default: Story = {
  args: {}
}
