import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { inputText, style, purpose, additionalRequest } = await request.json();

    if (!inputText) {
      return NextResponse.json({ error: '입력 문장이 필요합니다.' }, { status: 400 });
    }

    // 스타일과 목적에 따른 프롬프트 생성
    const stylePrompt = getStylePrompt(style);
    const purposePrompt = getPurposePrompt(purpose);
    const additionalPrompt = additionalRequest ? `\n추가 요청사항: ${additionalRequest}` : '';

    const systemPrompt = `당신은 전문적인 문장 교정 및 편집 전문가입니다. 
사용자가 입력한 문장을 다음 조건에 맞게 교정해 주세요:

${stylePrompt}
${purposePrompt}${additionalPrompt}

교정 시 다음 사항을 고려해 주세요:
- 맞춤법과 띄어쓰기를 정확하게 수정
- 문장의 논리적 흐름을 개선
- 불필요한 반복 제거
- 명확하고 간결한 표현으로 개선
- 원래 의미를 유지하면서 가독성 향상

교정된 문장만 답변으로 제공해 주세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: inputText }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const correctedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ correctedText });
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    return NextResponse.json(
      { error: 'API 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function getStylePrompt(style: string): string {
  switch (style) {
    case 'formal':
      return '문체: 격식체(-합니다, -했습니다 등)를 사용하여 정중하고 공식적인 문체로 작성해 주세요.';
    case 'informal':
      return '문체: 평어체(-함, -했음 등)를 사용하여 간결하고 직관적인 문체로 작성해 주세요.';
    case 'bullet':
      return '문체: 개조식(글머리 기호 사용)으로 핵심 내용을 요약하여 작성해 주세요.';
    default:
      return '문체: 자연스럽고 읽기 쉬운 문체로 작성해 주세요.';
  }
}

function getPurposePrompt(purpose: string): string {
  switch (purpose) {
    case 'internal':
      return '목적: 내부 보고용 문서로 사용할 예정이므로, 업무적이고 효율적인 톤으로 작성해 주세요.';
    case 'external':
      return '목적: 외부 보고용 문서로 사용할 예정이므로, 전문적이고 신뢰할 수 있는 톤으로 작성해 주세요.';
    case 'document':
      return '목적: 일반적인 문서 작성용이므로, 명확하고 체계적인 톤으로 작성해 주세요.';
    default:
      return '목적: 일반적인 용도로 사용할 예정이므로, 적절한 톤으로 작성해 주세요.';
  }
} 