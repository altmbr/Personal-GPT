# Deploying My Personal GPT to Netlify

This guide will walk you through deploying your personal GPT application to Netlify so that others can use it.

## Prerequisites

1. A Netlify account (free tier is fine)
2. Git installed on your computer
3. The Netlify CLI (optional, but recommended)

## Deployment Options

### Option 1: Deploy with Netlify CLI (Recommended)

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```
   netlify login
   ```

3. Initialize Netlify in your project folder:
   ```
   cd my-gpt-client
   netlify init
   ```

4. Follow the prompts to set up a new site or connect to an existing one.

5. Deploy your application:
   ```
   netlify deploy --prod
   ```

### Option 2: Deploy via the Netlify Website

1. Create a Git repository for your project:
   ```
   cd my-gpt-client
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a repository on GitHub, GitLab, or Bitbucket and push your code:
   ```
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

3. Go to [Netlify](https://app.netlify.com/) and log in.

4. Click "New site from Git" and select your repository.

5. Configure your build settings:
   - Build command: `npm run build`
   - Publish directory: `public`

6. Click "Deploy site"

## After Deployment

1. Your site will be available at a Netlify subdomain (e.g., `your-site-name.netlify.app`)

2. You can configure a custom domain in the Netlify dashboard if desired.

3. Share the URL with others so they can use your Personal GPT application with their own API keys.

## Important Notes

- This deployment uses Netlify Functions (serverless) to proxy requests to OpenAI's API
- No API keys are stored on the server - each user must provide their own API key
- API keys are stored in the user's browser localStorage for convenience
- If you want to update your deployment, simply push changes to your Git repository or run `netlify deploy --prod` again
