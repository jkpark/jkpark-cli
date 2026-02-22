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

  const categories = fs.readdirSync(pluginsDir).filter(f => fs.statSync(path.join(pluginsDir, f)).isDirectory());
  
  const choices = [];
  for (const category of categories) {
    const pluginJsonPath = path.join(pluginsDir, category, 'plugin.json');
    let config = { name: category, description: 'No description provided' };
    if (fs.existsSync(pluginJsonPath)) {
      try {
        config = { ...config, ...JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8')) };
      } catch (e) {}
    }
    choices.push({ name: `${config.name} (${config.description})`, value: category });
  }
  return choices;
}

async function getSkills(category) {
  const skillsDir = path.join(__dirname, 'plugins', category, 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
  
  return skills.map(skill => {
    // Optionally look for a skill-specific metadata file here in the future
    return { name: skill, value: skill };
  });
}

async function runInstallWizard() {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다!\n');

  const categoryChoices = await getPlugins();

  // Step 0: Select Category
  const { selectedCategory } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCategory',
      message: '설치할 플러그인 카테고리를 선택하세요:',
      choices: categoryChoices
    }
  ]);

  // Step 0.1: Select Skills in that category
  const skillChoices = await getSkills(selectedCategory);
  if (skillChoices.length === 0) {
    console.log(`\n⚠️  ${selectedCategory} 카테고리에 설치 가능한 스킬이 없습니다.`);
    return;
  }

  const { selectedSkills } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedSkills',
      message: '설치할 스킬들을 선택하세요:',
      choices: skillChoices,
      validate: (answer) => answer.length > 0 ? true : '최소 하나 이상의 스킬을 선택해야 합니다.'
    }
  ]);

  // Step 1: Base Target Selection
  const { baseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'baseType',
      message: '설치 타겟 유형을 선택하세요:',
      choices: [
        { name: 'OpenClaw', value: 'openclaw' },
        { name: 'Custom Path', value: 'custom' }
      ]
    }
  ]);

  let finalTargetDir;

  if (baseType === 'openclaw') {
    const openClawRoot = path.join(os.homedir(), '.openclaw');
    
    // Scan for workspaces
    let workspaces = [];
    if (fs.existsSync(openClawRoot)) {
      workspaces = fs.readdirSync(openClawRoot)
        .filter(f => f.startsWith('workspace-') && fs.statSync(path.join(openClawRoot, f)).isDirectory());
    }

    const { scope } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scope',
        message: 'OpenClaw 설치 범위를 선택하세요:',
        choices: [
          { name: 'Shared Skills (모든 에이전트 공유: ~/.openclaw/skills)', value: path.join(openClawRoot, 'skills') },
          ...workspaces.map(ws => ({ name: `Workspace: ${ws} (해당 에이전트 전용)`, value: path.join(openClawRoot, ws) })),
          { name: 'Custom Path inside OpenClaw', value: 'custom_inner' }
        ]
      }
    ]);

    if (scope === 'custom_inner') {
      const { innerPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'innerPath',
          message: 'OpenClaw 내부의 상대 경로를 입력하세요 (예: my-project):',
          validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
        }
      ]);
      finalTargetDir = path.join(openClawRoot, innerPath);
    } else {
      finalTargetDir = scope;
    }
  } else {
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message: '절대 경로 또는 현재 디렉토리 기준 상대 경로를 입력하세요:',
        validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
      }
    ]);
    finalTargetDir = path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath);
  }

  // Base path for skills
  const skillsBaseDir = path.join(finalTargetDir, 'skills');

  console.log(`\n📍 Base Target Path: ${finalTargetDir}`);
  console.log(`📂 Category: ${selectedCategory}`);
  console.log(`🛠️  Selected Skills: ${selectedSkills.join(', ')}`);
  console.log(`🚀 Installation Path: ${skillsBaseDir}/{skill_name}\n`);

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: '위 설정대로 설치를 진행할까요?',
      default: true
    }
  ]);

  if (proceed) {
    console.log('\n🚀 설치를 시작합니다...');
    
    if (!fs.existsSync(skillsBaseDir)) {
      fs.mkdirSync(skillsBaseDir, { recursive: true });
    }

    for (const skill of selectedSkills) {
      const srcDir = path.join(__dirname, 'plugins', selectedCategory, 'skills', skill);
      const destDir = path.join(skillsBaseDir, skill);

      try {
        console.log(`- [${skill}] 복사 중: ${srcDir} -> ${destDir}`);
        await fsExtra.copy(srcDir, destDir);
        console.log(`  ✅ [${skill}] 설치 완료`);
      } catch (err) {
        console.error(`  ❌ [${skill}] 설치 실패:`, err.message);
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
