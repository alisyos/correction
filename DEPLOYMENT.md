# Vercel 배포 가이드

## 사전 준비

1. **OpenAI API 키 발급**
   - [OpenAI Platform](https://platform.openai.com)에 접속
   - API Keys 섹션에서 새 API 키 생성
   - 생성된 키를 안전한 곳에 저장

2. **Vercel 계정 준비**
   - [Vercel](https://vercel.com)에 GitHub 계정으로 가입
   - 프로젝트 연결 준비

## 배포 단계

### 1단계: GitHub 저장소 생성
```bash
# 현재 디렉토리를 Git 저장소로 초기화 (이미 완료됨)
git add .
git commit -m "Initial commit: AI 문장 교정 시스템"

# GitHub에 새 저장소 생성 후 연결
git remote add origin https://github.com/your-username/correction.git
git push -u origin main
```

### 2단계: Vercel 프로젝트 생성
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소에서 방금 생성한 프로젝트 선택
3. "Import" 클릭

### 3단계: 환경 변수 설정
Vercel 프로젝트 설정에서 Environment Variables 추가:

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-...` (발급받은 OpenAI API 키) |

### 4단계: 배포 완료
- 환경 변수 저장 후 자동으로 배포 시작
- 배포 완료 시 Vercel이 제공하는 URL로 접속 가능

## 로컬 개발 환경 설정

배포 전 로컬에서 테스트하려면:

1. `.env.local` 파일 생성:
```bash
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. http://localhost:3000에서 테스트

## 주의사항

- **API 키 보안**: 환경 변수로만 관리하고 코드에 직접 입력하지 않음
- **Usage 모니터링**: OpenAI API 사용량을 정기적으로 확인
- **Error 처리**: API 오류 발생 시 적절한 사용자 메시지 표시

## 커스터마이징

### UI 수정
- `src/app/page.tsx`: 메인 페이지 UI
- `tailwind.config.ts`: 스타일 설정

### API 로직 수정
- `src/app/api/correct/route.ts`: OpenAI API 연동 로직
- 프롬프트 엔지니어링으로 교정 품질 향상 가능

### 추가 기능 구현
- 파일 업로드 기능
- 교정 히스토리 저장
- 다양한 AI 모델 선택
- 사용자 인증 시스템

## 문제 해결

### 일반적인 오류
1. **API 키 오류**: 환경 변수 설정 확인
2. **배포 실패**: Vercel 로그에서 오류 메시지 확인
3. **API 응답 없음**: OpenAI API 상태 및 요금 한도 확인

### 성능 최적화
- API 응답 캐싱
- 요청 debouncing
- 이미지 최적화
- Code splitting 