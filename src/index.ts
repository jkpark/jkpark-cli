import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { runInstallWizard, runListCommand } from './commands/install';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.env.JKPARK_CLI_ROOT || path.join(__dirname, '..');

const program = new Command();

program
  .name('jkpark')
  .description('JK Park의 개인용 패키지 관리 도구')
  .version('2.3.0');

program
  .command('install')
  .description('패키지 설치 마법사를 실행합니다')
  .action(() => runInstallWizard(projectRoot));

program
  .command('list')
  .description('사용 가능한 모든 플러그인과 스킬을 나열합니다')
  .action(() => runListCommand(projectRoot));

async function runMainMenu() {
  console.log('\n🏗️  jkpark CLI - Main Menu\n');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '수행할 작업을 선택하세요:',
      choices: [
        { name: '🚀 Install Skills (설치 마법사)', value: 'install' },
        { name: '📦 List Available (목록 보기)', value: 'list' },
        { name: '❌ Exit (종료)', value: 'exit' }
      ]
    }
  ]);

  if (action === 'install') {
    await runInstallWizard(projectRoot);
  } else if (action === 'list') {
    await runListCommand(projectRoot);
  } else {
    process.exit(0);
  }
}

// If no command is provided, show interactive main menu
if (!process.argv.slice(2).length) {
  runMainMenu().catch(console.error);
} else {
  program.parse(process.argv);
}
