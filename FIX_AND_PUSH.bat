@echo off
echo Fixing build errors and pushing to GitHub...

echo Adding changes...
git add .

echo Committing fixes...
git commit -m "🔧 Fix build errors: Add missing X import and fix Textarea import path"

echo Pushing to trigger deployment...
git push origin main

echo Done! Vercel should now deploy successfully.
pause
