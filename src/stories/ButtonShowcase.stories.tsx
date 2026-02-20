import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default' | 'ghost'

interface StoryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  small?: boolean
  round?: boolean
  loading?: boolean
}

const StoryButton: React.FC<StoryButtonProps> = ({
  variant = 'default',
  small = false,
  round = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => (
  <button
    className={cn(
      variant === 'primary' && 'btn btn-primary',
      variant === 'secondary' && 'btn btn',
      variant === 'danger' && 'btn btn-error',
      variant === 'default' && 'btn',
      variant === 'ghost' && 'btn btn-ghost',
      small && 'btn-sm',
      round && 'btn-circle',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <span className="loading loading-spinner loading-xs" />}
    {children}
  </button>
)

const meta: Meta<typeof StoryButton> = {
  title: 'Showcase/Button Showcase',
  component: StoryButton,
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
type Story = StoryObj<typeof StoryButton>

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
            <StoryButton variant="primary">Get Started</StoryButton>
            <StoryButton variant="ghost">Learn More</StoryButton>
          </div>
        </section>

        {/* Primary Actions Section */}
        <Section
          title="Primary Actions"
          description="Main call-to-action buttons used for important user actions like starting games, saving data, or confirming actions."
        >
          <ButtonGroup title="Standard Primary Buttons">
            <StoryButton variant="primary">Start New Game</StoryButton>
            <StoryButton variant="primary" loading>
              Processing...
            </StoryButton>
            <StoryButton variant="primary" disabled>
              Disabled Action
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Small Primary Buttons">
            <StoryButton variant="primary" small>
              Save Game
            </StoryButton>
            <StoryButton variant="primary" small loading>
              Loading...
            </StoryButton>
            <StoryButton variant="primary" small disabled>
              Disabled
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Round Primary Buttons">
            <StoryButton variant="primary" round aria-label="Add Player">
              +
            </StoryButton>
            <StoryButton variant="primary" round small aria-label="Quick Add">
              +
            </StoryButton>
            <StoryButton variant="primary" round disabled aria-label="Disabled Add">
              +
            </StoryButton>
          </ButtonGroup>
        </Section>

        {/* Secondary Actions Section */}
        <Section
          title="Secondary Actions"
          description="Supporting actions that complement primary actions, often used for navigation, settings, or alternative options."
        >
          <ButtonGroup title="Standard Secondary Buttons">
            <StoryButton variant="secondary">View Statistics</StoryButton>
            <StoryButton variant="secondary" loading>
              Loading Stats...
            </StoryButton>
            <StoryButton variant="secondary" disabled>
              Stats Unavailable
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Small Secondary Buttons">
            <StoryButton variant="secondary" small>
              Edit Settings
            </StoryButton>
            <StoryButton variant="secondary" small loading>
              Updating...
            </StoryButton>
            <StoryButton variant="secondary" small disabled>
              Settings Locked
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Round Secondary Buttons">
            <StoryButton variant="secondary" round aria-label="Settings">
              ⚙️
            </StoryButton>
            <StoryButton variant="secondary" round small aria-label="Info">
              ℹ️
            </StoryButton>
            <StoryButton variant="secondary" round disabled aria-label="Disabled">
              🔒
            </StoryButton>
          </ButtonGroup>
        </Section>

        {/* Danger Actions Section */}
        <Section
          title="Danger Actions"
          description="Destructive actions that require user confirmation, such as deleting games, removing players, or resetting data."
        >
          <ButtonGroup title="Standard Danger Buttons">
            <StoryButton variant="danger">Delete Game</StoryButton>
            <StoryButton variant="danger" loading>
              Deleting...
            </StoryButton>
            <StoryButton variant="danger" disabled>
              Cannot Delete
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Small Danger Buttons">
            <StoryButton variant="danger" small>
              Remove Player
            </StoryButton>
            <StoryButton variant="danger" small loading>
              Removing...
            </StoryButton>
            <StoryButton variant="danger" small disabled>
              Cannot Remove
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Round Danger Buttons">
            <StoryButton variant="danger" round aria-label="Delete">
              🗑️
            </StoryButton>
            <StoryButton variant="danger" round small aria-label="Remove">
              ✕
            </StoryButton>
            <StoryButton variant="danger" round disabled aria-label="Locked">
              🔒
            </StoryButton>
          </ButtonGroup>
        </Section>

        {/* Default Actions Section */}
        <Section
          title="Default Actions"
          description="Standard buttons for general actions, form submissions, and neutral interactions."
        >
          <ButtonGroup title="Standard Default Buttons">
            <StoryButton variant="default">Submit Form</StoryButton>
            <StoryButton variant="default" loading>
              Submitting...
            </StoryButton>
            <StoryButton variant="default" disabled>
              Form Invalid
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Small Default Buttons">
            <StoryButton variant="default" small>
              Cancel
            </StoryButton>
            <StoryButton variant="default" small loading>
              Processing...
            </StoryButton>
            <StoryButton variant="default" small disabled>
              Unavailable
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Round Default Buttons">
            <StoryButton variant="default" round aria-label="Close">
              ✕
            </StoryButton>
            <StoryButton variant="default" round small aria-label="Minimize">
              −
            </StoryButton>
            <StoryButton variant="default" round disabled aria-label="Disabled">
              ○
            </StoryButton>
          </ButtonGroup>
        </Section>

        {/* Ghost Actions Section */}
        <Section
          title="Ghost Actions"
          description="Subtle, minimal buttons that blend into the background, often used for secondary actions or in dense interfaces."
        >
          <ButtonGroup title="Standard Ghost Buttons">
            <StoryButton variant="ghost">View Details</StoryButton>
            <StoryButton variant="ghost" loading>
              Loading...
            </StoryButton>
            <StoryButton variant="ghost" disabled>
              No Details
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Small Ghost Buttons">
            <StoryButton variant="ghost" small>
              Edit
            </StoryButton>
            <StoryButton variant="ghost" small loading>
              Updating...
            </StoryButton>
            <StoryButton variant="ghost" small disabled>
              Read Only
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Round Ghost Buttons">
            <StoryButton variant="ghost" round aria-label="Favorite">
              ★
            </StoryButton>
            <StoryButton variant="ghost" round small aria-label="Share">
              📤
            </StoryButton>
            <StoryButton variant="ghost" round disabled aria-label="Unavailable">
              ○
            </StoryButton>
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
                <StoryButton variant="primary">Start Turn</StoryButton>
                <StoryButton variant="secondary">View Hand</StoryButton>
                <StoryButton variant="ghost" small>
                  Pass
                </StoryButton>
                <StoryButton variant="danger" small>
                  Concede
                </StoryButton>
                <StoryButton variant="default" round aria-label="Pause">
                  ⏸️
                </StoryButton>
              </div>
            </div>

            {/* Player Management Example */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
              <h4 className="mb-3 font-medium text-slate-200">Player Management</h4>
              <p className="mb-4 text-sm text-slate-400">
                Interface for adding, editing, and removing players from a game.
              </p>
              <div className="flex flex-wrap gap-3">
                <StoryButton variant="primary" small>
                  Add Player
                </StoryButton>
                <StoryButton variant="ghost" small>
                  Edit Life
                </StoryButton>
                <StoryButton variant="secondary" small>
                  View Stats
                </StoryButton>
                <StoryButton variant="danger" small>
                  Remove
                </StoryButton>
                <StoryButton variant="ghost" round small aria-label="More Options">
                  ⋯
                </StoryButton>
              </div>
            </div>

            {/* Settings Panel Example */}
            <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
              <h4 className="mb-3 font-medium text-slate-200">Settings Panel</h4>
              <p className="mb-4 text-sm text-slate-400">
                Configuration options for game preferences and application settings.
              </p>
              <div className="flex flex-wrap gap-3">
                <StoryButton variant="secondary">Save Settings</StoryButton>
                <StoryButton variant="default">Reset to Default</StoryButton>
                <StoryButton variant="ghost" small>
                  Import
                </StoryButton>
                <StoryButton variant="ghost" small>
                  Export
                </StoryButton>
                <StoryButton variant="danger" small>
                  Clear Data
                </StoryButton>
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
              <StoryButton variant="primary" aria-label="Start new game session">
                Start Game
              </StoryButton>
              <StoryButton variant="secondary" round aria-label="Open settings menu">
                ⚙️
              </StoryButton>
              <StoryButton variant="danger" aria-label="Delete current game">
                Delete Game
              </StoryButton>
              <StoryButton variant="ghost" small aria-label="View game history">
                History
              </StoryButton>
              <StoryButton variant="default" round small aria-label="Close current dialog">
                ✕
              </StoryButton>
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
            <StoryButton variant="primary" loading>
              Processing...
            </StoryButton>
            <StoryButton variant="primary" small loading>
              Loading...
            </StoryButton>
            <StoryButton variant="primary" round loading aria-label="Loading">
              ⋯
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Secondary Loading States">
            <StoryButton variant="secondary" loading>
              Updating...
            </StoryButton>
            <StoryButton variant="secondary" small loading>
              Syncing...
            </StoryButton>
            <StoryButton variant="secondary" round loading aria-label="Loading">
              ⋯
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Danger Loading States">
            <StoryButton variant="danger" loading>
              Deleting...
            </StoryButton>
            <StoryButton variant="danger" small loading>
              Removing...
            </StoryButton>
            <StoryButton variant="danger" round loading aria-label="Loading">
              ⋯
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Default Loading States">
            <StoryButton variant="default" loading>
              Submitting...
            </StoryButton>
            <StoryButton variant="default" small loading>
              Saving...
            </StoryButton>
            <StoryButton variant="default" round loading aria-label="Loading">
              ⋯
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Ghost Loading States">
            <StoryButton variant="ghost" loading>
              Loading...
            </StoryButton>
            <StoryButton variant="ghost" small loading>
              Updating...
            </StoryButton>
            <StoryButton variant="ghost" round loading aria-label="Loading">
              ⋯
            </StoryButton>
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
            <StoryButton variant="primary" disabled>
              Unavailable
            </StoryButton>
            <StoryButton variant="primary" small disabled>
              Locked
            </StoryButton>
            <StoryButton variant="primary" round disabled aria-label="Disabled">
              +
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Secondary Disabled States">
            <StoryButton variant="secondary" disabled>
              No Access
            </StoryButton>
            <StoryButton variant="secondary" small disabled>
              Blocked
            </StoryButton>
            <StoryButton variant="secondary" round disabled aria-label="Disabled">
              ⚙️
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Danger Disabled States">
            <StoryButton variant="danger" disabled>
              Cannot Delete
            </StoryButton>
            <StoryButton variant="danger" small disabled>
              Protected
            </StoryButton>
            <StoryButton variant="danger" round disabled aria-label="Disabled">
              🗑️
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Default Disabled States">
            <StoryButton variant="default" disabled>
              Form Invalid
            </StoryButton>
            <StoryButton variant="default" small disabled>
              Required Field
            </StoryButton>
            <StoryButton variant="default" round disabled aria-label="Disabled">
              ✕
            </StoryButton>
          </ButtonGroup>

          <ButtonGroup title="Ghost Disabled States">
            <StoryButton variant="ghost" disabled>
              No Permission
            </StoryButton>
            <StoryButton variant="ghost" small disabled>
              Read Only
            </StoryButton>
            <StoryButton variant="ghost" round disabled aria-label="Disabled">
              ★
            </StoryButton>
          </ButtonGroup>
        </div>
      </Section>
    </AppLayout>
  )
}
