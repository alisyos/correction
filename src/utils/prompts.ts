import fs from 'fs';
import path from 'path';

const PROMPTS_FILE_PATH = path.join(process.cwd(), 'src/data/prompts.json');

// 프롬프트 데이터 읽기
function readPrompts() {
  try {
    const data = fs.readFileSync(PROMPTS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('프롬프트 파일 읽기 오류:', error);
    // 기본 프롬프트 반환
    return {
      common: "당신은 전문 문서 교정 도우미입니다.",
      styles: {
        formal: "격식체로 작성하세요.",
        informal: "평어체로 작성하세요.",
        bullet: "개조식으로 작성하세요."
      },
      purposes: {
        document: "문서 작성용으로 작성하세요.",
        internal: "내부 보고용으로 작성하세요.",
        external: "외부 보고용으로 작성하세요."
      }
    };
  }
}

// 특정 프롬프트 조합 생성
export function generateSystemPrompt(style: string, purpose: string, additionalRequest?: string) {
  const prompts = readPrompts();
  
  const commonPrompt = prompts.common;
  const stylePrompt = prompts.styles[style] || '';
  const purposePrompt = prompts.purposes[purpose] || '';
  const additionalPrompt = additionalRequest ? `\n추가 요청사항: ${additionalRequest}` : '';

  return `${commonPrompt}\n\n[문체 지침]\n${stylePrompt}\n\n[목적별 지침]\n${purposePrompt}${additionalPrompt}\n\n교정된 문장만 답변으로 제공해주세요.`;
} 