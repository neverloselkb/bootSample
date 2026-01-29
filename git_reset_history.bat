@echo off
echo ========================================================
echo WARNING: This script will DELETE all Git commit history.
echo The current code will remain, but the history will be reset.
echo ========================================================
pause

:: 1. Create a new orphan branch (clean history)
git checkout --orphan latest_branch

:: 2. Add all files
git add -A

:: 3. Commit changes
git commit -m "Reset project history: Initial commit"

:: 4. Delete the main branch (try both main and master)
git branch -D main 2>nul
git branch -D master 2>nul

:: 5. Rename the current branch to main
git branch -m main

echo ========================================================
echo Local history has been reset.
echo To force update GitHub, run the following command manually:
echo.
echo git push -f origin main
echo ========================================================
pause
