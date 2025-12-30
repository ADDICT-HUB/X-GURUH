#!/bin/bash
echo "🚀 Starting on Heroku..."
export NODE_ENV=production
export PORT=$PORT
node universal-bot.js
