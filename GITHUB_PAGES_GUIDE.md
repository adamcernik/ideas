# GitHub Pages Deployment Guide

This guide walks you through the process of deploying your React app to GitHub Pages.

## Prerequisites

1. A GitHub account
2. A GitHub repository for your project
3. Git installed on your local machine
4. Node.js and npm installed on your local machine

## Steps to Deploy

### 1. Make sure your repository is set up correctly

- Your code should be pushed to a GitHub repository
- You should have commit access to this repository

### 2. Install the gh-pages package

```bash
npm install gh-pages --save-dev
```

### 3. Update your package.json

Add the following to your package.json:

```json
{
  "homepage": "https://yourusername.github.io/your-repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Replace `yourusername` with your GitHub username and `your-repo-name` with your repository name.

### 4. Deploy the app

```bash
npm run deploy
```

This command will:
- Build your React app (predeploy script)
- Create a gh-pages branch in your repository
- Push the build folder contents to this branch

### 5. Configure GitHub Pages

1. Go to your GitHub repository
2. Click on Settings
3. Scroll down to the GitHub Pages section
4. Select the `gh-pages` branch as the source
5. Your site will be published at the URL shown in the GitHub Pages section

### 6. Custom Domain (Optional)

If you want to use a custom domain:

1. Add your custom domain in the GitHub Pages settings
2. Create a CNAME file in the `public` folder with your domain name
3. Update the `homepage` in package.json to your custom domain

## Troubleshooting

- If your page shows a blank screen, check the browser console for errors
- Make sure you're using HashRouter instead of BrowserRouter in your React app
- Check that all paths (CSS, JS, images) are relative, not absolute
- If assets are missing, check the `PUBLIC_URL` environment variable

## Further Resources

- [Create React App Deployment](https://create-react-app.dev/docs/deployment/#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [SPA GitHub Pages](https://github.com/rafgraph/spa-github-pages) 