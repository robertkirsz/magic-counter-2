import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../components/Button'

const meta: Meta<typeof Button> = {
  title: 'Showcase/Button Showcase',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive showcase of all Button variants in realistic app layouts with text blocks and different use cases.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof Button>

// App Layout Component for Showcase
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100">
    <header className="border-b border-slate-700 bg-slate-800 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-white">Magic Counter 2</h1>
        <p className="text-slate-400">Button Component Showcase</p>
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

// Button Group Component
const ButtonGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="mb-3 text-lg font-medium text-slate-200">{title}</h3>
    <div className="flex flex-wrap gap-3">{children}</div>
  </div>
)

export const AllVariants: Story = {
  render: () => (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="mb-4 text-4xl font-bold">Welcome to Magic Counter 2</h1>
          <p className="mb-6 text-xl text-blue-100">
            Track your Magic: The Gathering games with precision and style. This showcase demonstrates all available
            button variants in realistic contexts.
          </p>
          <div className="flex gap-4">
            <Button variant="primary">Get Started</Button>
            <Button variant="ghost">Learn More</Button>
          </div>
        </section>

        {/* Primary Actions Section */}
        <Section
          title="Primary Actions"
          description="Main call-to-action buttons used for important user actions like starting games, saving data, or confirming actions."
        >
          <ButtonGroup title="Standard Primary Buttons">
            <Button variant="primary">Start New Game</Button>
            <Button variant="primary" loading>
              Processing...
            </Button>
            <Button variant="primary" disabled>
              Disabled Action
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Small Primary Buttons">
            <Button variant="primary" small>
              Save Game
            </Button>
            <Button variant="primary" small loading>
              Loading...
            </Button>
            <Button variant="primary" small disabled>
              Disabled
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Round Primary Buttons">
            <Button variant="primary" round aria-label="Add Player">
              +
            </Button>
            <Button variant="primary" round small aria-label="Quick Add">
              +
            </Button>
            <Button variant="primary" round disabled aria-label="Disabled Add">
              +
            </Button>
          </ButtonGroup>
        </Section>

        {/* Secondary Actions Section */}
        <Section
          title="Secondary Actions"
          description="Supporting actions that complement primary actions, often used for navigation, settings, or alternative options."
        >
          <ButtonGroup title="Standard Secondary Buttons">
            <Button variant="secondary">View Statistics</Button>
            <Button variant="secondary" loading>
              Loading Stats...
            </Button>
            <Button variant="secondary" disabled>
              Stats Unavailable
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Small Secondary Buttons">
            <Button variant="secondary" small>
              Edit Settings
            </Button>
            <Button variant="secondary" small loading>
              Updating...
            </Button>
            <Button variant="secondary" small disabled>
              Settings Locked
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Round Secondary Buttons">
            <Button variant="secondary" round aria-label="Settings">
              ⚙️
            </Button>
            <Button variant="secondary" round small aria-label="Info">
              ℹ️
            </Button>
            <Button variant="secondary" round disabled aria-label="Disabled">
              🔒
            </Button>
          </ButtonGroup>
        </Section>

        {/* Danger Actions Section */}
        <Section
          title="Danger Actions"
          description="Destructive actions that require user confirmation, such as deleting games, removing players, or resetting data."
        >
          <ButtonGroup title="Standard Danger Buttons">
            <Button variant="danger">Delete Game</Button>
            <Button variant="danger" loading>
              Deleting...
            </Button>
            <Button variant="danger" disabled>
              Cannot Delete
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Small Danger Buttons">
            <Button variant="danger" small>
              Remove Player
            </Button>
            <Button variant="danger" small loading>
              Removing...
            </Button>
            <Button variant="danger" small disabled>
              Cannot Remove
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Round Danger Buttons">
            <Button variant="danger" round aria-label="Delete">
              🗑️
            </Button>
            <Button variant="danger" round small aria-label="Remove">
              ✕
            </Button>
            <Button variant="danger" round disabled aria-label="Locked">
              🔒
            </Button>
          </ButtonGroup>
        </Section>

        {/* Default Actions Section */}
        <Section
          title="Default Actions"
          description="Standard buttons for general actions, form submissions, and neutral interactions."
        >
          <ButtonGroup title="Standard Default Buttons">
            <Button variant="default">Submit Form</Button>
            <Button variant="default" loading>
              Submitting...
            </Button>
            <Button variant="default" disabled>
              Form Invalid
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Small Default Buttons">
            <Button variant="default" small>
              Cancel
            </Button>
            <Button variant="default" small loading>
              Processing...
            </Button>
            <Button variant="default" small disabled>
              Unavailable
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Round Default Buttons">
            <Button variant="default" round aria-label="Close">
              ✕
            </Button>
            <Button variant="default" round small aria-label="Minimize">
              −
            </Button>
            <Button variant="default" round disabled aria-label="Disabled">
              ○
            </Button>
          </ButtonGroup>
        </Section>

        {/* Ghost Actions Section */}
        <Section
          title="Ghost Actions"
          description="Subtle, minimal buttons that blend into the background, often used for secondary actions or in dense interfaces."
        >
          <ButtonGroup title="Standard Ghost Buttons">
            <Button variant="ghost">View Details</Button>
            <Button variant="ghost" loading>
              Loading...
            </Button>
            <Button variant="ghost" disabled>
              No Details
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Small Ghost Buttons">
            <Button variant="ghost" small>
              Edit
            </Button>
            <Button variant="ghost" small loading>
              Updating...
            </Button>
            <Button variant="ghost" small disabled>
              Read Only
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Round Ghost Buttons">
            <Button variant="ghost" round aria-label="Favorite">
              ★
            </Button>
            <Button variant="ghost" round small aria-label="Share">
              📤
            </Button>
            <Button variant="ghost" round disabled aria-label="Unavailable">
              ○
            </Button>
          </ButtonGroup>
        </Section>

        {/* Interactive Examples Section */}
        <Section
          title="Interactive Examples"
          description="Real-world examples showing how buttons work together in different contexts."
        >
          <div className="space-y-6">
            {/* Game Controls Example */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
              <h4 className="mb-3 font-medium text-slate-200">Game Controls</h4>
              <p className="mb-4 text-sm text-slate-400">
                Control panel for managing an active Magic: The Gathering game session.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Start Turn</Button>
                <Button variant="secondary">View Hand</Button>
                <Button variant="ghost" small>
                  Pass
                </Button>
                <Button variant="danger" small>
                  Concede
                </Button>
                <Button variant="default" round aria-label="Pause">
                  ⏸️
                </Button>
              </div>
            </div>

            {/* Player Management Example */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
              <h4 className="mb-3 font-medium text-slate-200">Player Management</h4>
              <p className="mb-4 text-sm text-slate-400">
                Interface for adding, editing, and removing players from a game.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" small>
                  Add Player
                </Button>
                <Button variant="ghost" small>
                  Edit Life
                </Button>
                <Button variant="secondary" small>
                  View Stats
                </Button>
                <Button variant="danger" small>
                  Remove
                </Button>
                <Button variant="ghost" round small aria-label="More Options">
                  ⋯
                </Button>
              </div>
            </div>

            {/* Settings Panel Example */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
              <h4 className="mb-3 font-medium text-slate-200">Settings Panel</h4>
              <p className="mb-4 text-sm text-slate-400">
                Configuration options for game preferences and application settings.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary">Save Settings</Button>
                <Button variant="default">Reset to Default</Button>
                <Button variant="ghost" small>
                  Import
                </Button>
                <Button variant="ghost" small>
                  Export
                </Button>
                <Button variant="danger" small>
                  Clear Data
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Accessibility Section */}
        <Section
          title="Accessibility Features"
          description="Examples showing proper accessibility practices with buttons, including ARIA labels and keyboard navigation."
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              All buttons support keyboard navigation and screen readers. Round buttons include proper ARIA labels.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" aria-label="Start new game session">
                Start Game
              </Button>
              <Button variant="secondary" round aria-label="Open settings menu">
                ⚙️
              </Button>
              <Button variant="danger" aria-label="Delete current game">
                Delete Game
              </Button>
              <Button variant="ghost" small aria-label="View game history">
                History
              </Button>
              <Button variant="default" round small aria-label="Close current dialog">
                ✕
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}

export const LoadingStates: Story = {
  render: () => (
    <AppLayout>
      <Section
        title="Loading States"
        description="All button variants with loading states to show progress and prevent multiple submissions."
      >
        <div className="space-y-6">
          <ButtonGroup title="Primary Loading States">
            <Button variant="primary" loading>
              Processing...
            </Button>
            <Button variant="primary" small loading>
              Loading...
            </Button>
            <Button variant="primary" round loading aria-label="Loading">
              ⋯
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Secondary Loading States">
            <Button variant="secondary" loading>
              Updating...
            </Button>
            <Button variant="secondary" small loading>
              Syncing...
            </Button>
            <Button variant="secondary" round loading aria-label="Loading">
              ⋯
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Danger Loading States">
            <Button variant="danger" loading>
              Deleting...
            </Button>
            <Button variant="danger" small loading>
              Removing...
            </Button>
            <Button variant="danger" round loading aria-label="Loading">
              ⋯
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Default Loading States">
            <Button variant="default" loading>
              Submitting...
            </Button>
            <Button variant="default" small loading>
              Saving...
            </Button>
            <Button variant="default" round loading aria-label="Loading">
              ⋯
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Ghost Loading States">
            <Button variant="ghost" loading>
              Loading...
            </Button>
            <Button variant="ghost" small loading>
              Updating...
            </Button>
            <Button variant="ghost" round loading aria-label="Loading">
              ⋯
            </Button>
          </ButtonGroup>
        </div>
      </Section>
    </AppLayout>
  )
}

export const DisabledStates: Story = {
  render: () => (
    <AppLayout>
      <Section
        title="Disabled States"
        description="All button variants in disabled state, showing when actions are unavailable or conditions aren't met."
      >
        <div className="space-y-6">
          <ButtonGroup title="Primary Disabled States">
            <Button variant="primary" disabled>
              Unavailable
            </Button>
            <Button variant="primary" small disabled>
              Locked
            </Button>
            <Button variant="primary" round disabled aria-label="Disabled">
              +
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Secondary Disabled States">
            <Button variant="secondary" disabled>
              No Access
            </Button>
            <Button variant="secondary" small disabled>
              Blocked
            </Button>
            <Button variant="secondary" round disabled aria-label="Disabled">
              ⚙️
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Danger Disabled States">
            <Button variant="danger" disabled>
              Cannot Delete
            </Button>
            <Button variant="danger" small disabled>
              Protected
            </Button>
            <Button variant="danger" round disabled aria-label="Disabled">
              🗑️
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Default Disabled States">
            <Button variant="default" disabled>
              Form Invalid
            </Button>
            <Button variant="default" small disabled>
              Required Field
            </Button>
            <Button variant="default" round disabled aria-label="Disabled">
              ✕
            </Button>
          </ButtonGroup>

          <ButtonGroup title="Ghost Disabled States">
            <Button variant="ghost" disabled>
              No Permission
            </Button>
            <Button variant="ghost" small disabled>
              Read Only
            </Button>
            <Button variant="ghost" round disabled aria-label="Disabled">
              ★
            </Button>
          </ButtonGroup>
        </div>
      </Section>
    </AppLayout>
  )
}
