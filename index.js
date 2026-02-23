#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const os = require('os');

async function runInstallWizard() {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다!\n');

  // Step 1: Installation target
  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Step 1: Installation target을 선택하세요:',
      choices: [
        { name: 'OpenClaw (OpenClaw Global)', value: 'openClaw' },
        { name: 'Local (Current Directory)', value: 'local' }
      ]
    }
  ]);

  let rootPath = process.cwd();
  if (target === 'openClaw') {
    // OpenClaw global 폴더 (보통 ~/.openclaw)
    rootPath = path.join(os.homedir(), '.openclaw');
  }

  // Step 2: Installation Scope
  const { scope, customPath } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: 'Step 2: Installation Scope을 선택하세요:',
      choices: ['Global', 'Project', 'Custom Path']
    },
    {
      type: 'input',
      name: 'customPath',
      message: 'Custom Path를 입력하세요:',
      when: (answers) => answers.scope === 'Custom Path',
      validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
    }
  ]);

  let finalTargetDir = rootPath;

  if (scope === 'Global') {
    finalTargetDir = path.join(rootPath, 'global');
  } else if (scope === 'Project') {
    finalTargetDir = path.join(rootPath, 'projects');
  } else if (scope === 'Custom Path') {
    // Custom Path의 경우 입력받은 값을 그대로 사용하거나 rootPath와 결합
    finalTargetDir = path.isAbsolute(customPath) ? customPath : path.resolve(rootPath, customPath);
  }

  console.log(`\n📍 최종 설치 경로 (Target Path): ${finalTargetDir}\n`);
  console.log('✅ 설치 마법사가 완료되었습니다. 형, 다음 단계를 진행할 준비가 됐어! 🐾');
}

program
  .name('jkpark')
  .description('JK Park의 개인용 패키지 관리 도구')
  .version('1.0.0');

program
  .command('install')
  .description('패키지 설치 마법사를 실행합니다')
  .action(runInstallWizard);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
