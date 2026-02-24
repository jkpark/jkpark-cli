# Install Command

## Step 1: Install Target Path 설정

설치할 경로를 설정하는 단계입니다.

아래 항목들중 하나의 항목을 선택할 수 있도록 한다.
  - openclaw (workspace)
  - antigravity (workspace)
  - custom path

`openclaw (workspace)`의 경우 기본적으로 `~/.openclaw/workspace/skills` 를 target path 로 설정한다.
`antigravity (workspace)`의 경우 기본적으로 `<project-root>/.agent/skills` 를 target path 로 설정한다. `project-root`는 현재 터미널이 실행되고 있는 디렉토리로 한다.
`custom path`의 경우 사용자가 직접 경로를 입력할 수 있도록 한다.


## Step 2: Install Target Path 확인

설정된 Target Path 를 출력한다.
사용자에게 설치할 경로를 확인한다.

## Step 3: 설치 옵션 선택

Option 1 : 직접 설치
타겟 폴더에 직접 설치한다.

Option 2 : 심볼릭 링크로 설치

설치할 스킬들을 `~/.jkpark/skills` 에 설치하고, Target Path에 심볼릭 링크를 생성한다.

## Step 4: 설치할 Skills 선택

설치할 Skills 를 선택하는 단계입니다.

`skills` 폴더에 있는 모든 툴을 보여주며, 복수개를 선택할 수 있도록 한다.

## Step 5: 설치할 Skills 확인

선택된 Skills 를 출력한다.
사용자에게 설치할 Skills 를 확인한다.
