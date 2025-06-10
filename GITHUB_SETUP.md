# GitHub 저장소 생성 및 배포 가이드

## 1단계: GitHub 저장소 생성

1. **GitHub 웹사이트 접속**
   - https://github.com 접속
   - 로그인

2. **새 저장소 생성**
   - 우측 상단 "+" 버튼 클릭 → "New repository"
   - Repository name: `ai-sentence-correction` (또는 원하는 이름)
   - Description: `AI 문장 교정 시스템 - OpenAI API 기반`
   - Public/Private 선택
   - "Create repository" 클릭

## 2단계: 로컬 프로젝트와 연결

생성된 저장소 페이지에서 제공되는 명령어를 참고하여 다음을 실행:

```bash
# 원격 저장소 연결 (GitHub에서 제공되는 URL 사용)
git remote add origin https://github.com/your-username/ai-sentence-correction.git

# 기본 브랜치 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

## 3단계: Vercel 배포

### Vercel 연결
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. 방금 생성한 저장소 선택
5. "Import" 클릭

### 환경 변수 설정
Vercel 프로젝트 설정에서:
1. Settings → Environment Variables
2. 다음 변수 추가:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...` (OpenAI API 키)
   - Environment: Production (및 필요시 Preview, Development)

### 배포 완료
- 환경 변수 저장 후 자동 배포 시작
- 배포 완료 시 Vercel 도메인 주소 제공

## 4단계: 지속적 배포

이후 코드 변경 시:
```bash
git add .
git commit -m "업데이트 내용"
git push
```
→ Vercel에서 자동으로 재배포됩니다.

## 주의사항

1. **API 키 보안**: 절대 코드에 직접 포함하지 말고 환경 변수로만 관리
2. **Usage 모니터링**: OpenAI API 사용량 정기 확인
3. **Domain 설정**: 필요시 Vercel에서 커스텀 도메인 설정 가능

## 현재 상태

✅ 프로젝트 완성 및 로컬 커밋 완료
⏳ GitHub 저장소 생성 및 푸시 대기
⏳ Vercel 배포 대기

위 단계를 따라 진행하시면 프로젝트가 성공적으로 배포됩니다! 