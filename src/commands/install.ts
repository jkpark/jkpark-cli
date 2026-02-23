import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { PathManager } from '../core/path-manager';
import { PluginManager } from '../core/plugin-manager';

export async function runInstallWizard(projectRoot: string) {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다!\n');

  const pluginManager = new PluginManager(projectRoot);
  const categoryChoices = await pluginManager.getCategories();

  if (categoryChoices.length === 0) {
    console.log('❌ 설치 가능한 플러그인이 없습니다. plugins 폴더를 확인해 주세요.');
    return;
  }

  // 1. Target Type Selection
  const { targetType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'targetType',
      message: '설치 타겟 유형을 선택하세요:',
      choices: [
        { name: 'OpenClaw', value: 'openclaw' },
        { name: 'Claude', value: 'claude' },
        { name: 'GitHub', value: 'github' }
      ]
    }
  ]);

  // 2. Category Selection
  const { selectedCategory } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCategory',
      message: '설치할 플러그인 카테고리를 선택하세요:',
      choices: categoryChoices.map(c => ({ name: `${c.name} (${c.description})`, value: c.value }))
    }
  ]);

  // 3. Skill Selection
  const skills = await pluginManager.getSkills(selectedCategory);
  if (skills.length === 0) {
    console.log(`\n⚠️  ${selectedCategory} 카테고리에 설치 가능한 스킬이 없습니다.`);
    return;
  }

  const { selectedSkills } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedSkills',
      message: '설치할 스킬들을 선택하세요:',
      choices: skills.map(s => ({ name: `${s.name} - ${s.description}`, value: s.value })),
      validate: (answer) => answer.length > 0 ? true : '최소 하나 이상의 스킬을 선택해야 합니다.'
    }
  ]);

  let rootPath: string;
  if (targetType === 'openclaw') {
    rootPath = PathManager.getOpenClawRoot();
  } else if (targetType === 'claude') {
    rootPath = PathManager.getClaudeRoot();
  } else {
    rootPath = PathManager.getGitHubRoot();
  }

  const workspaces = PathManager.getWorkspaces(rootPath);

  // Define scope choices
  const scopeChoices: any[] = [
    { name: 'Current Directory (현재 프로젝트)', value: process.cwd() }
  ];

  if (targetType === 'openclaw') {
    scopeChoices.push({ name: `Shared Skills (모든 에이전트 공유: ${path.join(rootPath, 'skills')})`, value: path.join(rootPath, 'skills') });
  } else if (targetType === 'claude') {
    scopeChoices.push({ name: `Global Skills (~/.claude/skills)`, value: path.join(rootPath, 'skills') });
  } else if (targetType === 'github') {
    scopeChoices.push({ name: `GitHub Extensions (~/.config/gh/extensions)`, value: path.join(rootPath, 'extensions') });
  }

  scopeChoices.push(...workspaces.map(ws => ({ name: `Workspace: ${ws}`, value: path.join(rootPath, ws) })));
  scopeChoices.push({ name: 'Custom Path (직접 입력)', value: 'custom' });

  const { scope } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scope',
      message: `${targetType} 설치 범위를 선택하세요 (Default: Current Directory):`,
      choices: scopeChoices,
      default: 0
    }
  ]);

  let finalTargetDir: string;
  if (scope === 'custom') {
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message: '설치 경로를 입력하세요:',
        validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
      }
    ]);
    finalTargetDir = PathManager.resolveFinalPath(process.cwd(), customPath);
  } else {
    finalTargetDir = scope;
  }

  const skillsBaseDir = targetType === 'github' && scope.endsWith('extensions') 
    ? finalTargetDir 
    : path.join(finalTargetDir, 'skills');

  console.log(`\n📍 Base Target Path: ${finalTargetDir}`);
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
      const srcDir = pluginManager.getSkillSourcePath(selectedCategory, skill);
      const destDir = path.join(skillsBaseDir, skill);

      try {
        console.log(`- [${skill}] 복사 중...`);
        await fsExtra.copy(srcDir, destDir);
        console.log(`  ✅ [${skill}] 설치 완료`);
      } catch (err: any) {
        console.error(`  ❌ [${skill}] 설치 실패:`, err.message);
      }
    }
    console.log('\n✅ 모든 작업이 완료되었습니다. 형, 설치가 끝났어! 🐾');
  } else {
    console.log('\n❌ 설치가 취소되었습니다.');
  }
}

export async function runListCommand(projectRoot: string) {
  const pluginManager = new PluginManager(projectRoot);
  const categories = await pluginManager.getCategories();
  
  console.log('\n📦 사용 가능한 플러그인 목록:\n');
  
  for (const cat of categories) {
    console.log(`📂 ${cat.name} (${cat.description})`);
    const skills = await pluginManager.getSkills(cat.value);
    for (const skill of skills) {
      console.log(`  - ${skill.name}: ${skill.description}`);
    }
    console.log('');
  }
}
