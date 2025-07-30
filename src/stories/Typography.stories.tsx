import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography system showcasing various text elements, headers, paragraphs, and other text components.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj

const TypographyShowcase: React.FC = () => (
  <div className="space-y-8 p-6">
    {/* Headers */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Headers</h2>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Heading 1 - 4xl Bold</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Heading 2 - 3xl Bold</h2>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Heading 3 - 2xl Semibold</h3>
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Heading 4 - xl Semibold</h4>
        <h5 className="text-lg font-medium text-gray-900 dark:text-white">Heading 5 - lg Medium</h5>
        <h6 className="text-base font-medium text-gray-900 dark:text-white">Heading 6 - base Medium</h6>
      </div>
    </section>

    {/* Body Text */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Body Text</h2>
      <div className="space-y-2">
        <p className="text-lg text-gray-900 dark:text-white">
          Large paragraph text - This is a larger body text that provides good readability for important content.
        </p>
        <p className="text-base text-gray-900 dark:text-white">
          Base paragraph text - This is the standard body text size used throughout the application for regular content.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Small paragraph text - This smaller text is used for secondary information, captions, and less prominent
          content.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Extra small text - Used for very small details, timestamps, and metadata.
        </p>
      </div>
    </section>

    {/* Font Weights */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Font Weights</h2>
      <div className="space-y-2">
        <p className="text-base font-thin text-gray-900 dark:text-white">
          Thin weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-light text-gray-900 dark:text-white">
          Light weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-normal text-gray-900 dark:text-white">
          Normal weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-medium text-gray-900 dark:text-white">
          Medium weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Semibold weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-bold text-gray-900 dark:text-white">
          Bold weight - The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-base font-extrabold text-gray-900 dark:text-white">
          Extrabold weight - The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </section>

    {/* Text Colors */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Text Colors</h2>
      <div className="space-y-2">
        <p className="text-base text-gray-900 dark:text-white">Primary text - Main content color</p>
        <p className="text-base text-gray-700 dark:text-gray-300">Secondary text - Secondary content color</p>
        <p className="text-base text-gray-500 dark:text-gray-400">Tertiary text - Less prominent content</p>
        <p className="text-base text-blue-600 dark:text-blue-400">Link text - Interactive elements</p>
        <p className="text-base text-green-600 dark:text-green-400">Success text - Positive states</p>
        <p className="text-base text-red-600 dark:text-red-400">Error text - Error states</p>
        <p className="text-base text-yellow-600 dark:text-yellow-400">Warning text - Warning states</p>
      </div>
    </section>

    {/* Text Alignment */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Text Alignment</h2>
      <div className="space-y-2">
        <p className="text-base text-left text-gray-900 dark:text-white">
          Left aligned text - This is the default alignment for most content.
        </p>
        <p className="text-base text-center text-gray-900 dark:text-white">
          Center aligned text - Used for headings and special content.
        </p>
        <p className="text-base text-right text-gray-900 dark:text-white">
          Right aligned text - Used for numbers and specific layouts.
        </p>
        <p className="text-base text-justify text-gray-900 dark:text-white">
          Justified text - This creates even edges on both sides of the text block, useful for longer content.
        </p>
      </div>
    </section>

    {/* Text Transforms */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Text Transforms</h2>
      <div className="space-y-2">
        <p className="text-base uppercase text-gray-900 dark:text-white">
          Uppercase text - Used for labels and emphasis
        </p>
        <p className="text-base lowercase text-gray-900 dark:text-white">Lowercase text - Used for specific styling</p>
        <p className="text-base capitalize text-gray-900 dark:text-white">
          Capitalize text - Each word starts with a capital letter
        </p>
        <p className="text-base normal-case text-gray-900 dark:text-white">
          Normal case text - Default text transformation
        </p>
      </div>
    </section>

    {/* Line Heights */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Line Heights</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tight (leading-tight)</p>
          <p className="text-base leading-tight text-gray-900 dark:text-white">
            This text has tight line spacing. It's useful for headings and short content where you want to reduce
            vertical space. Multiple lines will be closer together.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Normal (leading-normal)</p>
          <p className="text-base leading-normal text-gray-900 dark:text-white">
            This text has normal line spacing. It's the default for most content and provides good readability. Multiple
            lines will have standard spacing between them.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Relaxed (leading-relaxed)</p>
          <p className="text-base leading-relaxed text-gray-900 dark:text-white">
            This text has relaxed line spacing. It's useful for longer content where you want to improve readability.
            Multiple lines will have more space between them.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loose (leading-loose)</p>
          <p className="text-base leading-loose text-gray-900 dark:text-white">
            This text has loose line spacing. It's used for very long content or when you want maximum readability.
            Multiple lines will have generous spacing between them.
          </p>
        </div>
      </div>
    </section>

    {/* Lists */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Lists</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Unordered List</h3>
          <ul className="list-disc list-inside space-y-1 text-base text-gray-900 dark:text-white">
            <li>First item in the list</li>
            <li>Second item with some longer text to show wrapping</li>
            <li>Third item</li>
            <li>
              Fourth item with <strong>bold text</strong> and <em>italic text</em>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Ordered List</h3>
          <ol className="list-decimal list-inside space-y-1 text-base text-gray-900 dark:text-white">
            <li>First numbered item</li>
            <li>Second numbered item with longer content</li>
            <li>Third numbered item</li>
            <li>
              Fourth numbered item with <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">code</code>
            </li>
          </ol>
        </div>
      </div>
    </section>

    {/* Code and Pre */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Code Elements</h2>
      <div className="space-y-2">
        <p className="text-base text-gray-900 dark:text-white">
          Inline code: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">const example = "code"</code>{' '}
          within text.
        </p>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-gray-900 dark:text-white">
            {`function example() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}`}
          </code>
        </pre>
      </div>
    </section>

    {/* Blockquotes */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Blockquotes</h2>
      <div className="space-y-2">
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300">
          "This is a blockquote example. It's used to highlight important quotes or testimonials."
        </blockquote>
        <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-700 dark:text-gray-300">
          "Another blockquote with different styling and longer content to show how it handles multiple lines of text."
        </blockquote>
      </div>
    </section>

    {/* Links */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Links</h2>
      <div className="space-y-2">
        <p className="text-base text-gray-900 dark:text-white">
          Regular link:{' '}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Click here
          </a>
        </p>
        <p className="text-base text-gray-900 dark:text-white">
          Link without underline:{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Click here
          </a>
        </p>
        <p className="text-base text-gray-900 dark:text-white">
          Visited link:{' '}
          <a
            href="#"
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 underline"
          >
            Visited link
          </a>
        </p>
      </div>
    </section>

    {/* Emphasis and Strong */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Emphasis and Strong</h2>
      <div className="space-y-2">
        <p className="text-base text-gray-900 dark:text-white">
          Text with <em>italic emphasis</em> and <strong>bold strong text</strong>.
        </p>
        <p className="text-base text-gray-900 dark:text-white">
          <strong>Bold paragraph</strong> - This entire paragraph is bold to show emphasis.
        </p>
        <p className="text-base text-gray-900 dark:text-white">
          <em>Italic paragraph</em> - This entire paragraph is italicized for emphasis.
        </p>
      </div>
    </section>
  </div>
)

export const Default: Story = {
  render: () => <TypographyShowcase />
}

export const Headers: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Heading 1 - 4xl Bold</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Heading 2 - 3xl Bold</h2>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Heading 3 - 2xl Semibold</h3>
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Heading 4 - xl Semibold</h4>
      <h5 className="text-lg font-medium text-gray-900 dark:text-white">Heading 5 - lg Medium</h5>
      <h6 className="text-base font-medium text-gray-900 dark:text-white">Heading 6 - base Medium</h6>
    </div>
  )
}

export const BodyText: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <p className="text-lg text-gray-900 dark:text-white">
        Large paragraph text - This is a larger body text that provides good readability for important content.
      </p>
      <p className="text-base text-gray-900 dark:text-white">
        Base paragraph text - This is the standard body text size used throughout the application for regular content.
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Small paragraph text - This smaller text is used for secondary information, captions, and less prominent
        content.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Extra small text - Used for very small details, timestamps, and metadata.
      </p>
    </div>
  )
}

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-2 p-6">
      <p className="text-base font-thin text-gray-900 dark:text-white">
        Thin weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-light text-gray-900 dark:text-white">
        Light weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-normal text-gray-900 dark:text-white">
        Normal weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-medium text-gray-900 dark:text-white">
        Medium weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-semibold text-gray-900 dark:text-white">
        Semibold weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-bold text-gray-900 dark:text-white">
        Bold weight - The quick brown fox jumps over the lazy dog
      </p>
      <p className="text-base font-extrabold text-gray-900 dark:text-white">
        Extrabold weight - The quick brown fox jumps over the lazy dog
      </p>
    </div>
  )
}

export const TextColors: Story = {
  render: () => (
    <div className="space-y-2 p-6">
      <p className="text-base text-gray-900 dark:text-white">Primary text - Main content color</p>
      <p className="text-base text-gray-700 dark:text-gray-300">Secondary text - Secondary content color</p>
      <p className="text-base text-gray-500 dark:text-gray-400">Tertiary text - Less prominent content</p>
      <p className="text-base text-blue-600 dark:text-blue-400">Link text - Interactive elements</p>
      <p className="text-base text-green-600 dark:text-green-400">Success text - Positive states</p>
      <p className="text-base text-red-600 dark:text-red-400">Error text - Error states</p>
      <p className="text-base text-yellow-600 dark:text-yellow-400">Warning text - Warning states</p>
    </div>
  )
}
