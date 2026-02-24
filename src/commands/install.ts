import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { PathManager } from '../core/path-manager';
import { SkillManager } from '../core/skill-manager';

export async function runInstallWizard(projectRoot: string) {
  console.log('\n🐾 jkpark 설치 마법사에 오신 걸 환영합니다!\n');

  const cwd = process.cwd();

  // Step 1: Install Target Path 설정
  const { targetType } = await inquirer.prompt([
    {
      type: 'select',
      name: 'targetType',
      message: '설치할 서비스(Target)를 선택하세요:',
      choices: [
        { name: 'openclaw (workspace)', value: 'openclaw' },
        { name: 'antigravity (workspace)', value: 'antigravity' },
        { name: 'custom path', value: 'custom' }
      ]
    }
  ]);

  let targetPath = '';
  if (targetType === 'openclaw') {
    targetPath = PathManager.getOpenClawWorkspaceRoot();
  } else if (targetType === 'antigravity') {
    targetPath = PathManager.getAntigravityRoot(cwd);
  } else {
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message: '설치 경로를 입력하세요:',
        validate: (input) => input.trim() !== '' ? true : '경로를 입력해야 합니다.'
      }
    ]);
    targetPath = PathManager.resolveFinalPath(cwd, customPath);
  }

  // Step 2: Install Target Path 확인
  console.log(`\n📍 설정된 Target Path: ${targetPath}`);
  const { pathConfirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'pathConfirm',
      message: '위 경로에 설치하시겠습니까?',
      default: true
    }
  ]);

  if (!pathConfirm) {
    console.log('\n❌ 설치가 취소되었습니다.');
    return;
  }

  // Step 3: 설치 옵션 선택
  const { installOption } = await inquirer.prompt([
    {
      type: 'select',
      name: 'installOption',
      message: '설치 옵션을 선택하세요:',
      choices: [
        { name: 'Option 1: 직접 설치 (타겟 폴더에 직접 복사)', value: 'direct' },
        { name: 'Option 2: 심볼릭 링크로 설치 (~/.jkpark/skills 에 설치 후 링크 생성)', value: 'symlink' }
      ]
    }
  ]);

  // Step 4: 설치할 Skills 선택
  const skillManager = new SkillManager(projectRoot);
  const allSkills = await skillManager.getAllSkills();

  if (allSkills.length === 0) {
    console.log('\n⚠️ 설치 가능한 스킬이 없습니다.');
    return;
  }

  const { selectedSkills } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedSkills',
      message: '설치할 스킬들을 선택하세요 (Space로 선택, Enter로 완료):',
      choices: allSkills.map(s => {
        const desc = s.description.length > 65 ? s.description.substring(0, 65) + '...' : s.description;
        return {
          name: `${s.value.padEnd(25)} - ${desc}`,
          value: s.value
        };
      }),
      loop: false,
      validate: (answer) => answer.length > 0 ? true : '최소 하나 이상의 스킬을 선택해야 합니다.'
    }
  ]);

  // Step 5: 설치할 Skills 확인
  console.log(`\n🛠️ 선택된 스킬 목록:`);
  selectedSkills.forEach((s: string) => console.log(`  - ${s}`));

  const { skillConfirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'skillConfirm',
      message: '위 스킬들을 설치하시겠습니까?',
      default: true
    }
  ]);

  if (!skillConfirm) {
    console.log('\n❌ 설치가 취소되었습니다.');
    return;
  }

  // 마무리: 설치(복사/심볼릭) 로직 구현
  console.log('\n🚀 설치를 시작합니다...');

  const jkparkSkillsRoot = PathManager.getJkparkSkillsRoot();

  if (installOption === 'direct') {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  } else {
    // symlink option: ensure jkpark skills root exists
    if (!fs.existsSync(jkparkSkillsRoot)) {
      fs.mkdirSync(jkparkSkillsRoot, { recursive: true });
    }
    // ensure target path exists to place junctions
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }

  for (const skillValue of selectedSkills) {
    const skillObj = allSkills.find(s => s.value === skillValue);
    if (!skillObj || !skillObj.sourcePath) continue;

    if (installOption === 'direct') {
      const destDir = path.join(targetPath, skillObj.name);
      try {
        console.log(`- [${skillValue}] 직접 복사 중...`);
        await fsExtra.copy(skillObj.sourcePath, destDir);
        console.log(`  ✅ [${skillValue}] 복사 완료`);
      } catch (err: any) {
        console.error(`  ❌ [${skillValue}] 복사 실패:`, err.message);
      }
    } else {
      // symlink option
      const baseDestDir = path.join(jkparkSkillsRoot, skillObj.name);
      const symlinkDestDir = path.join(targetPath, skillObj.name);

      try {
        console.log(`- [${skillValue}] ~/.jkpark/skills에 복사 중...`);
        await fsExtra.copy(skillObj.sourcePath, baseDestDir);

        console.log(`- [${skillValue}] 심볼릭 링크 생성 중...`);

        if (fs.existsSync(symlinkDestDir)) {
          fs.rmSync(symlinkDestDir, { recursive: true, force: true });
        }

        // Windows에서는 'junction', Linux/macOS 등에서는 'dir' 방식을 사용합니다.
        const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
        fs.symlinkSync(baseDestDir, symlinkDestDir, symlinkType);

        console.log(`  ✅ [${skillValue}] 링크 설치 완료 (${symlinkType} 방식)`);
      } catch (err: any) {
        console.error(`  ❌ [${skillValue}] 설치 실패:`, err.message);
      }
    }
  }

  console.log('\n✅ 모든 작업이 완료되었습니다! 🐾');
}

export async function runListCommand(projectRoot: string) {
  const skillManager = new SkillManager(projectRoot);
  const allSkills = await skillManager.getAllSkills();

  console.log('\n📦 사용 가능한 스킬 목록:\n');

  if (allSkills.length === 0) {
    console.log('  ⚠️ 설치 가능한 스킬이 없습니다.');
    return;
  }

  for (const skill of allSkills) {
    const desc = skill.description.length > 65 ? skill.description.substring(0, 65) + '...' : skill.description;
    console.log(`  - ${skill.name}: ${desc}`);
  }
  console.log('');
}
