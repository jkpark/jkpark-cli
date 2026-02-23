import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
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

// If no command is provided, show usage
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
