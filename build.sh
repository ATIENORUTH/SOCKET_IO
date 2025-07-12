#!/bin/bash

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies and build
cd client
npm install
npm run build
cd ..

echo "Build completed successfully!" 