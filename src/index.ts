import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInstallWizard } from './commands/install';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In a bundled environment, we need to know where the 'plugins' are.
// If bundled, they might be relative to the binary or we might expect them 
// in a specific location. For now, let's assume they are relative to 
// where the command is RUN from or a fixed project root.
const projectRoot = process.env.JKPARK_CLI_ROOT || path.join(__dirname, '..');

const program = new Command();

program
  .name('jkpark')
  .description('JK Park의 개인용 패키지 관리 도구 (Bun Edition)')
  .version('2.0.0');

program
  .command('install')
  .description('패키지 설치 마법사를 실행합니다')
  .action(() => runInstallWizard(projectRoot));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
