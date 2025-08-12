#!/bin/bash

echo "Pushing to GitHub repository..."
echo "You may be prompted for your GitHub username and password/token"
echo ""

# Try HTTPS with credentials
git remote set-url origin https://github.com/NoahByrnes/focus-timer-app.git

# Push to GitHub
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo "📦 Repository: https://github.com/NoahByrnes/focus-timer-app"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New' → 'Project'"
echo "3. Import your GitHub repository: focus-timer-app"
echo "4. Deploy with default settings (Vite will be auto-detected)"
echo ""
echo "Your app will be live in ~2 minutes! 🚀"