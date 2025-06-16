import { NextRequest, NextResponse } from 'next/server';
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

// 프롬프트 데이터 저장
function writePrompts(prompts: object) {
  try {
    const dir = path.dirname(PROMPTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROMPTS_FILE_PATH, JSON.stringify(prompts, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('프롬프트 파일 저장 오류:', error);
    return false;
  }
}

// GET: 프롬프트 조회
export async function GET() {
  try {
    const prompts = readPrompts();
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('프롬프트 조회 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 프롬프트 저장
export async function POST(request: NextRequest) {
  try {
    const prompts = await request.json();
    
    // 기본 구조 검증
    if (!prompts.common || !prompts.styles || !prompts.purposes) {
      return NextResponse.json(
        { error: '프롬프트 데이터 구조가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const success = writePrompts(prompts);
    
    if (success) {
      return NextResponse.json({ message: '프롬프트가 성공적으로 저장되었습니다.' });
    } else {
      return NextResponse.json(
        { error: '프롬프트 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('프롬프트 저장 오류:', error);
    return NextResponse.json(
      { error: '프롬프트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

 