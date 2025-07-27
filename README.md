# Magic Counter 2

A Progressive Web App (PWA) for Magic: The Gathering life counter and game tracking.

## Features

- **Progressive Web App (PWA)**: Installable on mobile and desktop devices
- **Offline Support**: Works without internet connection
- **Life Tracking**: Track life totals for multiple players
- **Game Management**: Start, pause, and finish games
- **Deck Management**: Organize and track your MTG decks
- **User Management**: Manage players and their information
- **Responsive Design**: Works on all device sizes

## PWA Features

This app is a fully functional Progressive Web App with the following capabilities:

- **Installable**: Can be installed on home screen (mobile) or desktop
- **Offline Functionality**: Works without internet connection
- **App-like Experience**: Fullscreen mode with native app feel
- **Automatic Updates**: Service worker handles updates seamlessly
- **Caching**: Intelligent caching for better performance

### Installation

1. Visit the app in a supported browser (Chrome, Edge, Safari, Firefox)
2. Look for the install prompt or use the browser's install option
3. The app will be added to your home screen or desktop
4. Launch the app like any other installed application

### Browser Support

- **Chrome/Edge**: Full PWA support with install prompt
- **Safari (iOS)**: Add to home screen via share menu
- **Firefox**: Full PWA support with install prompt
- **Other browsers**: May have limited PWA features

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactDom from 'eslint-plugin-react-dom'
import reactX from 'eslint-plugin-react-x'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
])
```
