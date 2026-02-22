import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { PathManager } from '../core/path-manager';
import { PluginManager } from '../core/plugin-manager';

export async function runInstallWizard(projectRoot: string) {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다! (Bun Powered)\n');

  const pluginManager = new PluginManager(projectRoot);
  const categoryChoices = await pluginManager.getCategories();

  if (categoryChoices.length === 0) {
    console.log('❌ 설치 가능한 플러그인이 없습니다. plugins 폴더를 확인해 주세요.');
    return;
  }

  // 1. Category Selection
  const { selectedCategory } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCategory',
      message: '설치할 플러그인 카테고리를 선택하세요:',
      choices: categoryChoices
    }
  ]);

  // 2. Skill Selection
  const skillChoices = await pluginManager.getSkills(selectedCategory);
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

  // 3. Target Selection
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

  let finalTargetDir: string;

  if (baseType === 'openclaw') {
    const openClawRoot = PathManager.getOpenClawRoot();
    const workspaces = PathManager.getWorkspaces();

    const { scope } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scope',
        message: 'OpenClaw 설치 범위를 선택하세요:',
        choices: [
          { name: 'Shared Skills (모든 에이전트 공유: ~/.openclaw/skills)', value: path.join(openClawRoot, 'skills') },
          ...workspaces.map(ws => ({ name: `Workspace: ${ws}`, value: path.join(openClawRoot, ws) })),
          { name: 'Custom Path inside OpenClaw', value: 'custom_inner' }
        ]
      }
    ]);

    if (scope === 'custom_inner') {
      const { innerPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'innerPath',
          message: 'OpenClaw 내부의 상대 경로를 입력하세요:',
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
        message: '설치 경로를 입력하세요:',
        validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
      }
    ]);
    finalTargetDir = PathManager.resolveFinalPath(process.cwd(), customPath);
  }

  const skillsBaseDir = path.join(finalTargetDir, 'skills');

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
