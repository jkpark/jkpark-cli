import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import fsExtra from 'fs-extra';
import { PathManager } from '../core/path-manager';

export async function runCleanCommand() {
    console.log('\n🧹 jkpark 캐시 정리 마법사에 오신 걸 환영합니다!\n');

    const jkparkSkillsRoot = PathManager.getJkparkSkillsRoot();
    const openClawTarget = PathManager.getOpenClawWorkspaceRoot();
    const antigravityTarget = PathManager.getAntigravityRoot(process.cwd());

    console.log(`📍 캐시 폴더 경로: ${jkparkSkillsRoot}`);
    console.log(`📍 타겟 폴더 (openclaw): ${openClawTarget}`);
    console.log(`📍 타겟 폴더 (antigravity): ${antigravityTarget}`);

    const { confirmClean } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmClean',
            message: `위 경로들의 스킬 캐시 공간을 비우고 각 타겟 폴더에 생성된 모든 심볼릭 링크(스킬 연결)를 삭제하시겠습니까?\n  (이 작업은 되돌릴 수 없으며 설치된 스킬 연결이 해제됩니다.)`,
            default: false
        }
    ]);

    if (!confirmClean) {
        console.log('\n❌ 캐시 비우기가 취소되었습니다.');
        return;
    }

    try {
        console.log('\n🗑️ 원본 캐시 삭제 중...');
        if (fs.existsSync(jkparkSkillsRoot)) {
            fsExtra.emptyDirSync(jkparkSkillsRoot);
            console.log(`  ✨ [${jkparkSkillsRoot}] 내부 비우기 완료`);
        } else {
            console.log(`  ✅ 캐시 폴더가 이미 비어있거나 없습니다.`);
        }

        console.log('\n🗑️ 타겟 심볼릭 링크 삭제 중...');
        const targets = [openClawTarget, antigravityTarget];

        for (const target of targets) {
            if (fs.existsSync(target)) {
                const items = fs.readdirSync(target);
                for (const item of items) {
                    const itemPath = path.join(target, item);
                    try {
                        const stat = fs.lstatSync(itemPath);
                        if (stat.isSymbolicLink()) {
                            fs.rmSync(itemPath, { recursive: true, force: true });
                            console.log(`  🔗 링크 삭제됨: ${itemPath}`);
                        }
                    } catch (e: any) {
                        // broken link lstat can still work, but catch errors just in case
                        console.log(`  ❌ 링크 삭제 실패: ${itemPath} (${e.message})`);
                    }
                }
            }
        }

        console.log('\n✨ 캐시 정리 및 링크 해제 작업이 깔끔하게 완료되었습니다!');
    } catch (error: any) {
        console.error('\n❌ 삭제 프로세스 중 에러가 발생했습니다:', error.message);
    }
}
