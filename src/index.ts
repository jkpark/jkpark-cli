import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInstallWizard, runListCommand } from './commands/install';
import { runCleanCommand } from './commands/clean';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.env.JKPARK_CLI_ROOT || path.join(__dirname, '..');

const program = new Command();

const VERSION = '2.3.2';

program
  .name('jkpark')
  .description('JK Park의 개인용 패키지 관리 도구')
  .version(VERSION);

program
  .command('install')
  .description('패키지 설치 마법사를 실행합니다')
  .action(() => runInstallWizard(projectRoot));

program
  .command('list')
  .description('사용 가능한 모든 플러그인과 스킬을 나열합니다')
  .action(() => runListCommand(projectRoot));

program
  .command('clean')
  .description('설치된 로컬 스킬 캐시(~/.jkpark/skills)를 모두 삭제하여 초기화합니다')
  .action(() => runCleanCommand());

// If no command is provided, show usage
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
