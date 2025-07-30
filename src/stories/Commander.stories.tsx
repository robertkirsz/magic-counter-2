import type { Meta, StoryObj } from '@storybook/react-vite'

import { Commander } from '../components/Commander'

const commander = {
  id: '1',
  name: 'Prossh, Skyraider of Kher',
  type: 'Legendary Creature — Dragon',
  colors: ['B', 'G', 'R'],
  image: 'https://cards.scryfall.io/art_crop/front/8/8/889c1a0f-7df2-4497-8058-04358173d7e8.jpg?1562438016'
  // image: 'https://place-hold.it/300'
}

const meta: Meta<typeof Commander> = {
  title: 'Components/Commander',
  component: Commander,
  tags: ['autodocs'],
  args: { commander }
}

export default meta

type Story = StoryObj<typeof Commander>

export const Default: Story = {
  args: {}
}

export const ResponsiveWidths: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Commander Component at Different Container Widths</h2>

      <div className="flex gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">80px</h3>
          <div className="w-[80px]">
            <Commander commander={commander} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">120px</h3>
          <div className="w-[120px]">
            <Commander commander={commander} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">200px</h3>
          <div className="w-[200px]">
            <Commander commander={commander} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">300px</h3>
          <div className="w-[300px]">
            <Commander commander={commander} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-2">Full Width</h3>
        <div className="w-full">
          <Commander commander={commander} />
        </div>
      </div>
    </div>
  )
}
