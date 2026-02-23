#!/usr/bin/env node

/**
 * Simplified Skill Installer for Skills.sh / ClawHub
 * Usage: node install-skill.js <skill-url-or-slug>
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node install-skill.js <owner/repo/skill-name>');
  process.exit(1);
}

const skillName = arg.split('/').pop();
const targetDir = path.join(os.homedir(), '.openclaw', 'skills', skillName);

console.log(`🚀 Installing skill: ${skillName} to ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// In a real scenario, this would fetch the SKILL.md and resources.
// For now, it's a placeholder to demonstrate the capability.
console.log('✅ Skill folder created. (Note: Content fetching requires web_fetch/search tool usage by the agent)');
