#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const os = require('os');

const fs = require('fs');
const fsExtra = require('fs-extra'); // fs-extra for easier recursive copy

async function getPlugins() {
  const pluginsDir = path.join(__dirname, 'plugins');
  if (!fs.existsSync(pluginsDir)) return [];

  const dirs = fs.readdirSync(pluginsDir).filter(f => fs.statSync(path.join(pluginsDir, f)).isDirectory());
  
  return dirs.map(dir => {
    const pluginJsonPath = path.join(pluginsDir, dir, 'plugin.json');
    let config = { name: dir, description: 'No description provided' };
    if (fs.existsSync(pluginJsonPath)) {
      try {
        config = { ...config, ...JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8')) };
      } catch (e) {}
    }
    return { name: `${config.name} (${config.description})`, value: dir };
  });
}

async function runInstallWizard() {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다!\n');

  const pluginChoices = await getPlugins();

  // Step 0: Select Plugins
  const { selectedPlugins } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedPlugins',
      message: '설치할 플러그인을 선택하세요:',
      choices: pluginChoices,
      validate: (answer) => answer.length > 0 ? true : '최소 하나 이상의 플러그인을 선택해야 합니다.'
    }
  ]);

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

  console.log(`\n📍 최종 설치 경로 (Target Path): ${finalTargetDir}`);
  console.log(`📦 선택된 플러그인: ${selectedPlugins.join(', ')}\n`);

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: '위 설정대로 설치를 진행할까요? (테스트 모드: 실제 복사 수행)',
      default: true
    }
  ]);

  if (proceed) {
    console.log('\n🚀 설치를 시작합니다...');
    
    // Ensure the target directory exists
    if (!fs.existsSync(finalTargetDir)) {
      fs.mkdirSync(finalTargetDir, { recursive: true });
    }

    for (const plugin of selectedPlugins) {
      const srcDir = path.join(__dirname, 'plugins', plugin);
      const destDir = path.join(finalTargetDir, plugin);

      try {
        console.log(`- [${plugin}] 복사 중: ${srcDir} -> ${destDir}`);
        // 실제 복사 수행 (fs-extra 사용)
        await fsExtra.copy(srcDir, destDir);
        console.log(`  ✅ [${plugin}] 설치 완료`);
      } catch (err) {
        console.error(`  ❌ [${plugin}] 설치 실패:`, err.message);
      }
    }
    
    console.log('\n✅ 모든 작업이 완료되었습니다. 형, 설치가 끝났어! 🐾');
  } else {
    console.log('\n❌ 설치가 취소되었습니다.');
  }
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
