#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

// 패키지 리스트 예시 (형이 원하는 리스트로 나중에 바꿀 수 있어요)
const packageChoices = [
  { name: 'React', value: 'react' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Tailwind CSS', value: 'tailwindcss' },
  { name: 'Axios', value: 'axios' },
  { name: 'Zustand', value: 'zustand' },
  { name: 'Lucide React (Icons)', value: 'lucide-react' }
];

async function runWizard() {
  console.log('\n🐾 jkpark 패키지 마법사에 오신 걸 환영합니다!\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'packages',
      message: '설치하고 싶은 패키지를 선택하세요:',
      choices: packageChoices,
      validate: (answer) => {
        if (answer.length < 1) {
          return '최소 하나 이상의 패키지를 선택해야 합니다.';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: '선택한 패키지를 현재 폴더에 설치할까요?',
      default: true
    }
  ]);

  if (answers.confirm) {
    const installCmd = `npm install ${answers.packages.join(' ')}`;
    console.log(`\n🚚 설치 중: ${installCmd}...`);
    try {
      execSync(installCmd, { stdio: 'inherit' });
      console.log('\n✅ 설치가 완료되었습니다! 형, 이제 개발 시작하세요! 🐾');
    } catch (error) {
      console.error('\n❌ 설치 중 오류가 발생했습니다.');
    }
  } else {
    console.log('\n👋 설치를 취소했습니다.');
  }
}

program
  .name('jkpark')
  .description('JK Park의 개인용 패키지 관리 도구')
  .version('1.0.0');

program
  .command('install')
  .description('패키지 설치 마법사를 실행합니다')
  .action(runWizard);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
