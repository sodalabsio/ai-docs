# AI Documentation Checklist App

An interactive web application that transforms the comprehensive "Generative AI Usage Documentation Checklist for Applied Research" into a user-friendly, dynamic experience.

## Features

- **Interactive Navigation System**: Browse through the three tiers (Foundations, Typical Components, Bleeding Edge)
- **Guided Workflow**: Step-by-step guidance for first-time users
- **Progress Tracking**: Mark checklist items as completed with local storage
- **Search Functionality**: Find specific topics or requirements quickly
- **Real-World Examples**: Practical examples for each documentation section

## Installation and Running Locally

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. Unzip the downloaded package
2. Open a terminal and navigate to the unzipped directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory and can be served by any static file server.

6. Deployment to git-pages:

```bash
npm run deploy
# or
yarn deploy
```
This will deploy the app to GitHub Pages. Make sure to set the `base` URL in `vite.config.js` to your repository name.

## Usage Guide

1. **Start with the Guided Workflow** if you're new to AI documentation
2. **Browse the navigation menu** to explore specific sections
3. **Use the search bar** to find particular topics
4. **Check off items** as you complete them to track your progress
5. **Explore examples** to see how to implement each documentation element

## License

This project is available for educational and research purposes.

## Acknowledgments

Based on the "Generative AI Usage Documentation Checklist for Applied Research" document.
