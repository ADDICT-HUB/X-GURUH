#!/bin/bash
echo "🚀 Quick Heroku Deployment"
echo "=========================\n"

# Clean up
echo "1. Cleaning..."
rm -f ADDICT-HUB-X-GUI autos data lib plugins sessions 2>/dev/null

# Update Procfile
echo "2. Updating Procfile..."
echo "web: node universal-bot.js" > Procfile

# Create .gitignore for Heroku
echo "3. Updating .gitignore..."
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Session files (never commit!)
whatsapp_auth/
auth_info*/
session*/
*.session
*.session.json

# Private repo symlinks
ADDICT-HUB-X-GUI
autos
data
lib
plugins
sessions

# OS
.DS_Store
Thumbs.db

# Termux
.cache/
GITIGNORE

# Commit and push
echo "4. Committing..."
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true

echo "5. Pushing to GitHub..."
git push origin main

echo "\n✅ Pushed to GitHub!"
echo "📱 Now go to Heroku Dashboard and deploy"
