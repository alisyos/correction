'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, FileText, Target, MessageSquare } from 'lucide-react';

interface PromptsData {
  common: string;
  styles: {
    formal: string;
    informal: string;
    bullet: string;
  };
  purposes: {
    document: string;
    internal: string;
    external: string;
  };
}

export default function AdminPage() {
  const [prompts, setPrompts] = useState<PromptsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 프롬프트 데이터 로드
  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        alert('프롬프트 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('프롬프트 로드 오류:', error);
      alert('프롬프트 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 프롬프트 데이터 저장
  const savePrompts = async () => {
    if (!prompts) return;

    try {
      setSaving(true);
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompts),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('프롬프트가 성공적으로 저장되었습니다.');
      } else {
        alert(result.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('프롬프트 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const updatePrompt = (category: string, key: string, value: string) => {
    if (!prompts) return;

    setPrompts(prev => {
      if (!prev) return prev;
      
      if (category === 'common') {
        return { ...prev, common: value };
      } else {
        return {
          ...prev,
          [category]: {
            ...prev[category as keyof Omit<PromptsData, 'common'>],
            [key]: value
          }
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>프롬프트 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!prompts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">프롬프트 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={loadPrompts}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">프롬프트 관리</h1>
                <p className="text-gray-600">AI 문장 교정 시스템의 프롬프트를 관리합니다</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadPrompts}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
              <button
                onClick={savePrompts}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 공통 프롬프트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">공통 프롬프트</h2>
            </div>
            <textarea
              value={prompts.common}
              onChange={(e) => updatePrompt('common', '', e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="모든 교정에 공통으로 적용될 기본 프롬프트를 입력하세요..."
            />
          </div>

          {/* 문체별 프롬프트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">문체별 프롬프트</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  격식체 (~합니다, ~했습니다)
                </label>
                <textarea
                  value={prompts.styles.formal}
                  onChange={(e) => updatePrompt('styles', 'formal', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                  placeholder="격식체 변환 지침을 입력하세요..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평어체 (~함, ~했음)
                </label>
                <textarea
                  value={prompts.styles.informal}
                  onChange={(e) => updatePrompt('styles', 'informal', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                  placeholder="평어체 변환 지침을 입력하세요..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개조식 (글머리 기호)
                </label>
                <textarea
                  value={prompts.styles.bullet}
                  onChange={(e) => updatePrompt('styles', 'bullet', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                  placeholder="개조식 변환 지침을 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* 목적별 프롬프트 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">목적별 프롬프트</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문서 작성
                </label>
                <textarea
                  value={prompts.purposes.document}
                  onChange={(e) => updatePrompt('purposes', 'document', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  placeholder="문서 작성용 지침을 입력하세요..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내부 보고
                </label>
                <textarea
                  value={prompts.purposes.internal}
                  onChange={(e) => updatePrompt('purposes', 'internal', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  placeholder="내부 보고용 지침을 입력하세요..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  외부 보고
                </label>
                <textarea
                  value={prompts.purposes.external}
                  onChange={(e) => updatePrompt('purposes', 'external', e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  placeholder="외부 보고용 지침을 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* 사용 안내 */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">사용 안내</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• <strong>공통 프롬프트</strong>: 모든 교정 작업에 기본적으로 적용되는 프롬프트입니다.</p>
              <p>• <strong>문체별 프롬프트</strong>: 사용자가 선택한 문체에 따라 추가로 적용되는 세부 지침입니다.</p>
              <p>• <strong>목적별 프롬프트</strong>: 사용 목적에 따라 추가로 적용되는 세부 지침입니다.</p>
              <p>• 프롬프트 수정 후 반드시 <strong>&lsquo;저장&rsquo;</strong> 버튼을 클릭해야 적용됩니다.</p>
              <p>• 변경사항은 즉시 메인 교정 시스템에 반영됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 