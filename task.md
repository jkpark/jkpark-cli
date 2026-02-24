# 개발 목표: "Local Skill Sync Manager"
GitHub 저장소의 특정 경로에 있는 스킬 데이터를 구조화하여 저장하고, 로컬 디렉토리(external-skills)와 버전 기반의 동기화를 수행하는 자동화 도구 구축.

## 주요 기능 명세 (Feature Set)
Registry 관리: skills-external.json을 데이터베이스 삼아 스킬의 메타데이터(Repo URL, Title, Description, Current Version)를 관리합니다.

스마트 다운로드: 중복 다운로드를 방지하고, 지정된 폴더 구조에 맞춰 스킬 코드를 배치합니다.

버전 및 업데이트 체킹: GitHub의 Commit Hash 또는 특정 Version Tag를 비교하여 로컬 파일과 원격 저장소 간의 차이를 식별하고 업데이트합니다.

## 단계별 개발 마일스톤

### Phase 1: 데이터 구조 설계 및 스캔 (Registry)
목표: GitHub URL로부터 필요한 정보를 추출하고 JSON 파일에 기록하는 로직 구현.

주요 작업:

skills-external.json 파일 포맷 정의 (JSON Schema).

GitHub URL 파싱 모듈 개발 (Owner, Repo, Path 추출).

이미 존재하는 스킬인지 확인하는 중복 검사 로직.

### Phase 2: 다운로드 엔진 구축 (Fetch)
목표: 원격 저장소의 파일을 로컬 external-skills 폴더로 복제.

주요 작업:

Git Clone 또는 GitHub API를 이용한 특정 폴더 다운로드 기능.

external-skills/{skill_name} 형태의 디렉토리 구조 자동 생성.

다운로드 완료 후 로컬에 현재 버전 정보를 skills-external.json파일에서 해당 스킬의 Current Version에 업데이트.

### Phase 3: 버전 관리 및 동기화 (Sync)
목표: 로컬 버전과 원격 버전을 비교하여 최신화.

주요 작업:

GitHub API를 통한 최신 커밋 해시(SHA) 또는 태그 조회.

비교 로직: If (Local_SHA != Remote_SHA) -> Update().

업데이트 시 기존 파일 백업 또는 덮어쓰기 전략 수립.