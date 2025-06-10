'use client';

import { useState } from 'react';
import { Copy, FileText, Wand2, Loader2, Upload, X } from 'lucide-react';
import * as mammoth from 'mammoth';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState('formal');
  const [purpose, setPurpose] = useState('document');
  const [additionalRequest, setAdditionalRequest] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');

  const handleCorrect = async () => {
    if (!inputText.trim()) {
      alert('교정할 문장을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText,
          style,
          purpose,
          additionalRequest,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCorrectedText(data.correctedText);
      } else {
        alert(data.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('API 호출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      alert('텍스트가 복사되었습니다.');
    } catch (error) {
      console.error('복사 오류:', error);
      alert('복사 중 오류가 발생했습니다.');
    }
  };

  const handleClear = () => {
    setInputText('');
    setCorrectedText('');
    setAdditionalRequest('');
    setUploadedFile(null);
    setInputMode('text');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 확장자 검증 (더 신뢰할 수 있음)
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.txt', '.doc', '.docx'];
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    // MIME 타입 검증 (보조적으로 사용)
    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream', // 일부 시스템에서 워드 파일의 기본 MIME 타입
      '' // 일부 브라우저에서 빈 문자열로 반환되는 경우
    ];
    
    console.log('파일 정보:', { name: file.name, type: file.type, size: file.size });
    
    if (!isValidExtension) {
      alert('지원하지 않는 파일 형식입니다. txt, doc, docx 파일만 업로드 가능합니다.');
      return;
    }

    setIsFileLoading(true);
    setUploadedFile(file);

    try {
      let extractedText = '';
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.txt')) {
        // txt 파일 처리
        extractedText = await readTextFile(file);
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        // word 파일 처리
        extractedText = await readWordFile(file);
      } else {
        throw new Error('지원하지 않는 파일 형식입니다.');
      }

      if (!extractedText.trim()) {
        alert('파일에서 텍스트를 추출할 수 없습니다. 파일 내용을 확인해 주세요.');
        setUploadedFile(null);
        return;
      }

      setInputText(extractedText);
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      alert(`파일을 읽는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setUploadedFile(null);
    } finally {
      setIsFileLoading(false);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'UTF-8');
    });
  };

  const readWordFile = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages && result.messages.length > 0) {
        console.warn('Word 파일 변환 경고:', result.messages);
      }
      
      return result.value || '';
    } catch (error) {
      console.error('Word 파일 읽기 오류:', error);
      throw new Error('Word 파일을 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setInputText('');
  };

  const handleModeChange = (mode: 'text' | 'file') => {
    setInputMode(mode);
    setInputText('');
    setUploadedFile(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wand2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI 문장 교정 시스템</h1>
          </div>
          <p className="text-gray-600">OpenAI를 활용한 전문적인 문장 교정 및 정리 도구</p>
        </div>

                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
           {/* 입력 영역 */}
           <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                         <div className="flex items-center gap-2 mb-4">
               <FileText className="w-5 h-5 text-indigo-600" />
               <h2 className="text-xl font-semibold text-gray-800">입력</h2>
             </div>

             {/* 입력 방식 선택 탭 */}
             <div className="mb-4">
               <div className="flex border-b border-gray-200">
                 <button
                   onClick={() => handleModeChange('text')}
                   className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                     inputMode === 'text'
                       ? 'border-indigo-500 text-indigo-600'
                       : 'border-transparent text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   직접 입력
                 </button>
                 <button
                   onClick={() => handleModeChange('file')}
                   className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                     inputMode === 'file'
                       ? 'border-indigo-500 text-indigo-600'
                       : 'border-transparent text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   파일 업로드
                 </button>
               </div>
             </div>

             {/* 직접 입력 모드 */}
             {inputMode === 'text' && (
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   교정할 문장
                 </label>
                 <textarea
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   placeholder="교정하고 싶은 문장이나 메모를 입력하세요..."
                   className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                 />
               </div>
             )}

             {/* 파일 업로드 모드 */}
             {inputMode === 'file' && (
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   파일 업로드
                 </label>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                   {uploadedFile ? (
                     <div className="space-y-3">
                       <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                         <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-indigo-600" />
                           <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                           <span className="text-xs text-gray-500">
                             ({(uploadedFile.size / 1024).toFixed(1)}KB)
                           </span>
                         </div>
                         <button
                           onClick={removeFile}
                           className="text-red-500 hover:text-red-700 p-1"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                       {inputText && (
                         <div className="text-left">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             추출된 텍스트 (확인 및 수정 가능)
                           </label>
                           <textarea
                             value={inputText}
                             onChange={(e) => setInputText(e.target.value)}
                             className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                           />
                         </div>
                       )}
                     </div>
                   ) : (
                     <div>
                       <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                       <p className="text-sm text-gray-600 mb-2">
                         txt 또는 word 파일을 업로드하세요
                       </p>
                       <input
                         type="file"
                         accept=".txt,.doc,.docx"
                         onChange={handleFileUpload}
                         className="hidden"
                         id="file-upload"
                         disabled={isFileLoading}
                       />
                       <label
                         htmlFor="file-upload"
                         className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm"
                       >
                         {isFileLoading ? (
                           <>
                             <Loader2 className="w-4 h-4 animate-spin" />
                             파일 읽는 중...
                           </>
                         ) : (
                           <>
                             <Upload className="w-4 h-4" />
                             파일 선택
                           </>
                         )}
                       </label>
                     </div>
                   )}
                 </div>
               </div>
             )}

            {/* 문체 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문체 선택
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="formal">격식체 (-합니다, -했습니다)</option>
                <option value="informal">평어체 (-함, -했음)</option>
                <option value="bullet">개조식 (글머리 기호)</option>
              </select>
            </div>

            {/* 사용 목적 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용 목적
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="internal">내부 보고</option>
                <option value="external">외부 보고</option>
                <option value="document">문서 작성</option>
              </select>
            </div>

            {/* 추가 요청 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기타 요청 (선택사항)
              </label>
              <input
                type="text"
                value={additionalRequest}
                onChange={(e) => setAdditionalRequest(e.target.value)}
                placeholder="예: 중요한 내용은 강조해줘, 간단하게 요약해줘"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleCorrect}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    교정 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    문장 교정
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

                     {/* 출력 영역 */}
           <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">교정 결과</h2>
              </div>
              {correctedText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-3 py-1 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  복사
                </button>
              )}
            </div>

            <div className="min-h-[300px] p-4 border border-gray-200 rounded-lg bg-gray-50">
              {correctedText ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {correctedText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  교정된 문장이 여기에 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">사용 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">문체 옵션</h4>
              <ul className="space-y-1">
                <li>• 격식체: 공식적인 문서용</li>
                <li>• 평어체: 간결한 업무용</li>
                <li>• 개조식: 발표자료용</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">사용 목적</h4>
              <ul className="space-y-1">
                <li>• 내부 보고: 업무적 톤</li>
                <li>• 외부 보고: 전문적 톤</li>
                <li>• 문서 작성: 체계적 톤</li>
              </ul>
            </div>
                         <div className="p-4 bg-purple-50 rounded-lg">
               <h4 className="font-medium text-purple-800 mb-2">추가 기능</h4>
               <ul className="space-y-1">
                 <li>• 파일 업로드 (txt, word)</li>
                 <li>• 원클릭 복사 기능</li>
                 <li>• 맞춤형 요청 처리</li>
                 <li>• 실시간 AI 교정</li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
