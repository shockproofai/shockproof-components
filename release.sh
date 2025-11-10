#!/bin/bash
set -e

# Get version type from argument (patch, minor, major)
VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."
echo "📦 Version bump type: $VERSION_TYPE"

# Update version in package.json
echo "📝 Bumping version..."
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: $NEW_VERSION"

# Build the project
echo "🔨 Building project..."
npm run build

# Stage changes
echo "📤 Staging changes..."
git add package.json package-lock.json dist/

# Commit
echo "💾 Committing..."
git commit -m "Release v$NEW_VERSION"

# Create tag
echo "🏷️  Creating tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# Push
echo "⬆️  Pushing to remote..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✨ Release v$NEW_VERSION complete!"
