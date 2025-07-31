import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { Button } from '../components/Button'
import { CommanderSearch } from '../components/CommanderSearch'
import { ImportanceSlider } from '../components/ImportanceSlider'
import { ManaPicker } from '../components/ManaPicker'
import type { ManaColor } from '../constants/mana'
import { ImportanceProvider } from '../contexts/ImportanceContext'
import type { ScryfallCard } from '../types/global'

const meta: Meta = {
  title: 'Showcase/Form Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive showcase of all form UI elements in realistic app layouts with different use cases and states.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj

// App Layout Component for Showcase
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100">
    <header className="border-b border-slate-700 bg-slate-800 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-white">Magic Counter 2</h1>
        <p className="text-slate-400">Form Elements Showcase</p>
      </div>
    </header>

    <main className="mx-auto max-w-6xl p-6">{children}</main>
  </div>
)

// Section Component
const Section = ({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <section className="mb-12 rounded-lg border border-slate-700 bg-slate-800 p-6">
    <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
    <p className="mb-6 text-slate-400">{description}</p>
    {children}
  </section>
)

// Form Group Component
const FormGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="mb-3 text-lg font-medium text-slate-200">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
)

// Interactive Form Components
const TextInputExample = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (e.target.value.length < 3 && e.target.value.length > 0) {
      setError('Name must be at least 3 characters')
    } else {
      setError('')
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="text-input" className="block text-sm font-medium text-slate-200">
        Player Name
      </label>
      <input
        id="text-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter player name..."
        className={`form-input ${error ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : ''}`}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

const NumberInputExample = () => {
  const [value, setValue] = useState('40')

  return (
    <div className="space-y-2">
      <label htmlFor="number-input" className="block text-sm font-medium text-slate-200">
        Starting Life Total
      </label>
      <input
        id="number-input"
        type="number"
        min="1"
        max="999"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="form-input-number hide-number-arrows"
      />
    </div>
  )
}

const RangeInputExample = () => {
  const [value, setValue] = useState(40)

  return (
    <div className="space-y-2">
      <label htmlFor="range-input" className="block text-sm font-medium text-slate-200">
        Life Total: {value}
      </label>
      <input
        id="range-input"
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="form-input-range"
      />
    </div>
  )
}

const TextareaExample = () => {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-2">
      <label htmlFor="textarea-input" className="block text-sm font-medium text-slate-200">
        Game Notes
      </label>
      <textarea
        id="textarea-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Enter game notes, strategies, or memorable moments..."
        rows={4}
        className="form-textarea"
      />
    </div>
  )
}

const CheckboxExample = () => {
  const [checked, setChecked] = useState(false)

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="form-checkbox"
        />
        <span className="text-sm text-slate-200">Enable turn tracking</span>
      </label>
    </div>
  )
}

const ManaPickerExample = () => {
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>([])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200">Deck Colors</label>
      <ManaPicker selectedColors={selectedColors} onColorToggle={handleColorToggle} />
      {selectedColors.length > 0 && <p className="text-sm text-slate-400">Selected: {selectedColors.join(', ')}</p>}
    </div>
  )
}

const CommanderSearchExample = () => {
  const [selectedCommander, setSelectedCommander] = useState<ScryfallCard | null>(null)

  const handleCommanderChange = (commander: ScryfallCard) => {
    setSelectedCommander(commander)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200">Commander Search</label>
      <CommanderSearch onChange={handleCommanderChange} />
      {selectedCommander && <p className="text-sm text-slate-400">Selected: {selectedCommander.name}</p>}
    </div>
  )
}

export const AllFormElements: Story = {
  render: () => (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
          <h1 className="mb-4 text-4xl font-bold">Form Elements Showcase</h1>
          <p className="mb-6 text-xl text-green-100">
            Discover all the form components available in Magic Counter 2. Each element is designed for optimal
            usability and accessibility in the context of Magic: The Gathering game management.
          </p>
        </section>

        {/* Basic Input Elements Section */}
        <Section
          title="Basic Input Elements"
          description="Standard form inputs for text, numbers, and user interaction. These form the foundation of all data entry in the application."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup title="Text Input">
              <TextInputExample />
            </FormGroup>

            <FormGroup title="Number Input">
              <NumberInputExample />
            </FormGroup>

            <FormGroup title="Range Slider">
              <RangeInputExample />
            </FormGroup>

            <FormGroup title="Textarea">
              <TextareaExample />
            </FormGroup>

            <FormGroup title="Checkbox">
              <CheckboxExample />
            </FormGroup>
          </div>
        </Section>

        {/* Specialized Components Section */}
        <Section
          title="Specialized Components"
          description="Custom form components designed specifically for Magic: The Gathering game management, including mana color selection and commander search."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup title="Mana Color Picker">
              <ManaPickerExample />
            </FormGroup>

            <FormGroup title="Commander Search">
              <CommanderSearchExample />
            </FormGroup>
          </div>
        </Section>

        {/* Form States Section */}
        <Section
          title="Form States & Validation"
          description="Examples showing different states of form elements including validation, loading, disabled, and error states."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup title="Input States">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Normal Input</label>
                  <input type="text" placeholder="Normal state..." className="form-input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Focused Input</label>
                  <input
                    type="text"
                    placeholder="Click to focus..."
                    className="form-input border-blue-400 ring-2 ring-blue-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Error Input</label>
                  <input
                    type="text"
                    placeholder="Error state..."
                    className="form-input border-red-500 focus:border-red-400 focus:ring-red-400"
                  />
                  <p className="text-sm text-red-400 mt-1">This field is required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Disabled Input</label>
                  <input
                    type="text"
                    placeholder="Disabled state..."
                    className="form-input opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </FormGroup>

            <FormGroup title="Loading & Interactive States">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Loading Search</label>
                  <div className="relative">
                    <input type="text" placeholder="Searching commanders..." className="form-input pr-10" disabled />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-600 border-t-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Interactive Range</label>
                  <RangeInputExample />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Multiple Checkboxes</label>
                  <div className="space-y-2">
                    {['Turn Tracking', 'Commander Damage', 'Life History', 'Auto-save'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="form-checkbox" />
                        <span className="text-sm text-slate-200">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </FormGroup>
          </div>
        </Section>

        {/* Real-world Examples Section */}
        <Section
          title="Real-world Examples"
          description="Complete form examples showing how form elements work together in realistic Magic: The Gathering game scenarios."
        >
          <div className="space-y-6">
            {/* User Creation Form */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-6">
              <h4 className="mb-4 font-medium text-slate-200">Create New Player</h4>
              <form className="space-y-4">
                <div>
                  <label htmlFor="player-name" className="block text-sm font-medium text-slate-200 mb-2">
                    Player Name
                  </label>
                  <input id="player-name" type="text" placeholder="Enter player name..." className="form-input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Preferred Colors</label>
                  <ManaPicker selectedColors={[]} onColorToggle={() => {}} />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Player
                  </Button>
                </div>
              </form>
            </div>

            {/* Game Setup Form */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-6">
              <h4 className="mb-4 font-medium text-slate-200">Game Configuration</h4>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="player-count" className="block text-sm font-medium text-slate-200 mb-2">
                      Number of Players
                    </label>
                    <input
                      id="player-count"
                      type="number"
                      min="1"
                      max="6"
                      defaultValue="4"
                      className="form-input-number hide-number-arrows"
                    />
                  </div>

                  <div>
                    <label htmlFor="starting-life" className="block text-sm font-medium text-slate-200 mb-2">
                      Starting Life
                    </label>
                    <input
                      id="starting-life"
                      type="number"
                      min="1"
                      max="999"
                      defaultValue="40"
                      className="form-input-number hide-number-arrows"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="text-sm text-slate-200">Enable turn tracking</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="text-sm text-slate-200">Track commander damage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-sm text-slate-200">Auto-save game state</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="game-notes" className="block text-sm font-medium text-slate-200 mb-2">
                    Game Notes
                  </label>
                  <textarea
                    id="game-notes"
                    placeholder="Optional notes about this game..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Start Game
                  </Button>
                </div>
              </form>
            </div>

            {/* Deck Creation Form */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-6">
              <h4 className="mb-4 font-medium text-slate-200">Create New Deck</h4>
              <form className="space-y-4">
                <div>
                  <label htmlFor="deck-name" className="block text-sm font-medium text-slate-200 mb-2">
                    Deck Name
                  </label>
                  <input id="deck-name" type="text" placeholder="Enter deck name..." className="form-input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Commander</label>
                  <CommanderSearch onChange={() => {}} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Deck Colors</label>
                  <ManaPicker selectedColors={[]} onColorToggle={() => {}} />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Deck
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Section>

        {/* Accessibility Section */}
        <Section
          title="Accessibility Features"
          description="Examples showing proper accessibility practices with form elements, including labels, ARIA attributes, and keyboard navigation."
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              All form elements support keyboard navigation and screen readers. Proper labels and ARIA attributes are
              included for optimal accessibility.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup title="Properly Labeled Inputs">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="accessible-input" className="block text-sm font-medium text-slate-200 mb-2">
                      Accessible Text Input
                    </label>
                    <input
                      id="accessible-input"
                      type="text"
                      placeholder="Type here..."
                      className="form-input"
                      aria-describedby="input-help"
                    />
                    <p id="input-help" className="text-sm text-slate-400 mt-1">
                      This input has proper labeling and help text
                    </p>
                  </div>

                  <div>
                    <label htmlFor="accessible-number" className="block text-sm font-medium text-slate-200 mb-2">
                      Accessible Number Input
                    </label>
                    <input
                      id="accessible-number"
                      type="number"
                      min="1"
                      max="999"
                      className="form-input-number hide-number-arrows"
                      aria-label="Life total between 1 and 999"
                    />
                  </div>
                </div>
              </FormGroup>

              <FormGroup title="Interactive Components">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Accessible Checkbox Group</label>
                    <div className="space-y-2" role="group" aria-labelledby="checkbox-group-label">
                      <div id="checkbox-group-label" className="sr-only">
                        Game options
                      </div>
                      {['Option 1', 'Option 2', 'Option 3'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="form-checkbox" />
                          <span className="text-sm text-slate-200">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Accessible Range Slider</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      defaultValue="50"
                      className="form-input-range"
                      aria-label="Value between 1 and 100"
                    />
                  </div>
                </div>
              </FormGroup>
            </div>
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}

export const ImportanceSliderShowcase: Story = {
  render: () => (
    <ImportanceProvider>
      <AppLayout>
        <Section
          title="Importance Slider"
          description="A specialized range input for controlling UI element visibility based on importance levels."
        >
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-6">
              <h4 className="mb-4 font-medium text-slate-200">Importance Control</h4>
              <p className="mb-4 text-sm text-slate-400">
                The importance slider controls which UI elements are visible. Elements with importance levels lower than
                the current setting are automatically hidden.
              </p>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-200">Importance Level:</span>
                <ImportanceSlider />
              </div>

              <div className="mt-6 space-y-2">
                <div className="importance-1 p-2 bg-blue-900 rounded">Level 1 - Always visible</div>
                <div className="importance-2 p-2 bg-green-900 rounded">Level 2 - Hidden when importance &lt; 2</div>
                <div className="importance-3 p-2 bg-yellow-900 rounded">Level 3 - Hidden when importance &lt; 3</div>
                <div className="importance-4 p-2 bg-orange-900 rounded">Level 4 - Hidden when importance &lt; 4</div>
                <div className="importance-5 p-2 bg-red-900 rounded">Level 5 - Hidden when importance &lt; 5</div>
              </div>
            </div>
          </div>
        </Section>
      </AppLayout>
    </ImportanceProvider>
  )
}

export const FormValidation: Story = {
  render: () => (
    <AppLayout>
      <Section
        title="Form Validation Examples"
        description="Examples showing different validation states and error handling in forms."
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-600 bg-slate-700 p-6">
            <h4 className="mb-4 font-medium text-slate-200">Validation States</h4>
            <form className="space-y-4">
              <div>
                <label htmlFor="valid-input" className="block text-sm font-medium text-slate-200 mb-2">
                  Valid Input
                </label>
                <input
                  id="valid-input"
                  type="text"
                  value="Valid value"
                  className="form-input border-green-500 focus:border-green-400 focus:ring-green-400"
                />
                <p className="text-sm text-green-400 mt-1">✓ Input is valid</p>
              </div>

              <div>
                <label htmlFor="invalid-input" className="block text-sm font-medium text-slate-200 mb-2">
                  Invalid Input
                </label>
                <input
                  id="invalid-input"
                  type="text"
                  value=""
                  className="form-input border-red-500 focus:border-red-400 focus:ring-red-400"
                />
                <p className="text-sm text-red-400 mt-1">✗ This field is required</p>
              </div>

              <div>
                <label htmlFor="warning-input" className="block text-sm font-medium text-slate-200 mb-2">
                  Warning Input
                </label>
                <input
                  id="warning-input"
                  type="text"
                  value="Short"
                  className="form-input border-yellow-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
                <p className="text-sm text-yellow-400 mt-1">⚠ Consider adding more detail</p>
              </div>
            </form>
          </div>
        </div>
      </Section>
    </AppLayout>
  )
}
