#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Run with: node deploy-check.js
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🚀 ROI Calculator - Deployment Checklist\n');

const checks = [
  {
    name: 'TypeScript Check',
    command: 'npm run check',
    description: 'Checking for TypeScript errors...'
  },
  {
    name: 'Build Test',
    command: 'npm run build',
    description: 'Testing production build...'
  },
  {
    name: 'Prisma Client',
    command: 'npx prisma generate',
    description: 'Generating Prisma client...'
  }
];

let allPassed = true;

for (const check of checks) {
  console.log(`⏳ ${check.description}`);
  
  try {
    execSync(check.command, { stdio: 'pipe' });
    console.log(`✅ ${check.name} - PASSED\n`);
  } catch (error) {
    console.log(`❌ ${check.name} - FAILED`);
    console.log(`Error: ${error.message}\n`);
    allPassed = false;
  }
}

// Check required files
const requiredFiles = [
  'vercel.json',
  'svelte.config.js',
  'package.json',
  'prisma/schema.prisma',
  '.env.example'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allPassed = false;
  }
}

// Check environment variables
console.log('\n🔧 Environment Variables Check...');
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  const requiredEnvVars = ['DATABASE_URL', 'PUBLIC_APP_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} - CONFIGURED`);
    } else {
      console.log(`⚠️  ${envVar} - NOT FOUND (may be set in production)`);
    }
  }
} else {
  console.log('⚠️  .env file not found (environment variables should be set in production)');
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Set environment variables in Vercel dashboard');
  console.log('4. Deploy!');
} else {
  console.log('❌ Some checks failed. Please fix the issues before deploying.');
  process.exit(1);
}

console.log('\n📖 See DEPLOYMENT.md for detailed instructions.');