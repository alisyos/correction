import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateSystemPrompt } from '../../../utils/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { inputText, style, purpose, additionalRequest } = await request.json();

    if (!inputText) {
      return NextResponse.json({ error: '입력 문장이 필요합니다.' }, { status: 400 });
    }

    // 새로운 프롬프트 시스템 사용
    const systemPrompt = generateSystemPrompt(style, purpose, additionalRequest);

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

 