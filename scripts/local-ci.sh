#!/bin/bash
# Local CI script for AI Chat Platform
# Guidelines: Automated builds, unit tests, integration tests, lint checks

set -e

echo "Starting Local CI Pipeline..."

# 1. Backend Validation
echo "--- Validating Backend ---"
cd backend
./gradlew clean build test
cd ..

# 2. Frontend Validation
echo "--- Validating Frontend ---"
cd frontend
# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
# npm test # If tests existed
cd ..

echo "CI Pipeline Successful!"
