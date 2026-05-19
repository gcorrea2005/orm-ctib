#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 22
echo "Using Node: $(node --version)"
cd /Users/gcorrea/Desktop/myProgs/ipodApp
npm run start
