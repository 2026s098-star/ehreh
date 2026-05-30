import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Map, 
  Compass, 
  FileText, 
  Award, 
  Search, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  MapPin, 
  Calendar,
  Sparkles,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { HISTORICAL_SOURCES, CURRICULUM_LESSONS, DOKDO_QUIZ } from "./data";
import { LessonId, SourceDocument, ReviewResponse } from "./types";
import ObservabilitySimulator from "./components/ObservabilitySimulator";

export default function App() {
  const [activeTab, setActiveTab] = useState<LessonId>("lesson1");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("sejong");
  const [sourceFilter, setSourceFilter] = useState<"all" | "KOR" | "JPN">("all");
  
  // Quiz states
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Co-authoring activity states
  const [studentKOR, setStudentKOR] = useState<string>("");
  const [studentJPN, setStudentJPN] = useState<string>("");
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Address cards interaction states
  const [activeAddressCard, setActiveAddressCard] = useState<"isabu" | "ahn" | null>(null);

  // Load API status checked on launch
  useEffect(() => {
    fetch("/api/config/status")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.warn("Could not check API Key status:", err);
      });
  }, []);

  // Pre-fill textbook template helper
  const handleLoadTemplate = () => {
    setStudentKOR("이지호");
    setStudentJPN("사토 하루키 (佐藤 陽葵)");
    setChapterTitle("동해의 평화로운 섬, 독도의 고증과 화해");
    setDraftContent(
      "동해의 평화로운 섬 독도는 다양한 한일 역사적 사료에서 그 귀속 증명이 명확합니다. " +
      "한국의 『세종실록지리지(1454년)』에는 날씨가 맑으면 수평선 너머로 또렷이 보인다고 적혀 있으며, " +
      "일본 근대 최고 행정조직의 기록인 『태정관 지령(1877년)』에서도 독도가 일본 영토가 아님을 전격 시인하였습니다. " +
      "우리는 지나친 갈등의 배타적 주장을 무력 단절하기 보다는, 명확한 고문서 사실을 직시하고 상호 우호적인 배타적 경제수역 관리와 동해의 지속 가능한 수자원 보전을 위해 평화롭게 손을 맞잡고 나가야 합니다."
    );
  };

  // Submit joint draft to server-side Gemini API
  const handleReviewDraft = async () => {
    if (!draftContent.trim()) {
      setReviewError("서술문 초안을 입력해 주세요.");
      return;
    }
    
    setIsReviewing(true);
    setReviewResult(null);
    setReviewError(null);

    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: draftContent,
          authorKorean: studentKOR || "이지호 (한국 학생)",
          authorJapanese: studentJPN || "하루키 (일본 학생)",
          lessonTitle: chapterTitle || "평화의 바다 공동 헌장"
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Gemin API 요청 중 오류가 발생했습니다.");
      }

      const result: ReviewResponse = await response.json();
      setReviewResult(result);
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || "서버와 연결할 수 없거나 API 요청 전송 중 이상이 발생했습니다.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Process Quiz selection
  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    const currentQuiz = DOKDO_QUIZ[currentQuizIndex];
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQuiz.correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (currentQuizIndex < DOKDO_QUIZ.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  // Safe fetch values
  const currentSource = HISTORICAL_SOURCES.find(s => s.id === selectedSourceId) || HISTORICAL_SOURCES[0];
  const filteredSources = HISTORICAL_SOURCES.filter(s => sourceFilter === "all" || s.country === sourceFilter);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-x-hidden font-sans relative text-slate-100" id="main-container">
      
      {/* Background Mesh Gradients */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white/5 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 z-20" id="sidebar">
        <div className="p-6 md:p-8 flex flex-col h-full justify-between">
          <div>
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setActiveTab("lesson1")}>
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <Compass className="w-5 h-5 text-slate-950 font-bold animate-pulse" />
              </div>
              <div>
                <h2 className="text-white hover:text-indigo-200 font-bold tracking-tight text-lg leading-tight">독도 영토 주권</h2>
                <p className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold">평화 교육 포털</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2.5 pb-2 font-bold">융합 교육 교과</p>
                
                <button
                  onClick={() => setActiveTab("lesson1")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    activeTab === "lesson1" 
                      ? "bg-white/10 text-white shadow-md border-l-4 border-amber-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-lesson1"
                >
                  <Map className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">1차시 • 지리적 특성과 영역</span>
                </button>

                <button
                  onClick={() => setActiveTab("lesson2")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    activeTab === "lesson2" 
                      ? "bg-white/10 text-white shadow-md border-l-4 border-amber-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-lesson2"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">2차시 • 역사적 사료 및 고지도</span>
                </button>

                <button
                  onClick={() => setActiveTab("lesson3")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    activeTab === "lesson3" 
                      ? "bg-white/10 text-white shadow-md border-l-4 border-amber-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-lesson3"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">3차시 • 현대 갈등과 평화 상생</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2.5 pb-2 font-bold">학생 참여형 마당</p>
                
                <button
                  onClick={() => setActiveTab("lesson4")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    activeTab === "lesson4" 
                      ? "bg-white/10 text-white shadow-md border-l-4 border-purple-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-activity"
                >
                  <Users className="w-4 h-4 shrink-0 text-purple-400" />
                  <span className="text-xs font-semibold flex items-center justify-between w-full">
                    <span>한·일 평화 교과서 집필</span>
                    <span className="bg-purple-500/20 text-[9px] text-purple-300 font-bold px-1.5 py-0.5 rounded-full uppercase border border-purple-500/30">AI</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                    activeTab === "quiz" 
                      ? "bg-white/10 text-white shadow-md border-l-4 border-indigo-500" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  id="tab-quiz"
                >
                  <Award className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span className="text-xs font-semibold">독도 평화 성찰 퀴즈</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-teal-400" />
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">수업보조 보증자재</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                대한민국 역사·지리 평화교육위원회 감수 교재 보조 팩트기반 학습 시스템입니다.
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>학기수업</span>
                <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded">최신인증 2026.05</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-8 z-10 overflow-y-auto max-w-7xl mx-auto w-full" id="main-content">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 bg-teal-950/40 border border-teal-500/20 px-2.5 py-1 rounded-full inline-block mb-1.5">
              중·고등 융합수업 지원 포털
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              독도 영토 주권 교육 한마당
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              객관적인 역사적 고문서 교차 고찰, 구면기하학적 분석 및 상호 화해 협력 방향 모색
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {/* Quick Fact Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 shadow-md backdrop-blur-md flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
              <span>포털 지표: <strong>울릉도-독도 87.4km</strong></span>
            </div>
          </div>
        </header>

        {/* API Warning banner (displayed as a beautiful frosted callout if api key is missing) */}
        {!hasApiKey && (
          <div className="bg-rose-500/10 border-2 border-dashed border-rose-500/30 backdrop-blur-md rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-300">Gemini API 키 미설정 경고</h4>
              <p className="text-[11px] text-slate-300 mt-1">
                현재 시스템에 <strong className="text-white">GEMINI_API_KEY</strong> 환경 변수가 설정되지 않았습니다. 
                이 상태에서는 <strong>'한·일 평화 교과서 집필 양식'</strong>의 AI 공동 검수 및 문맥 교정 추천 기능이 작동하지 않습니다. 
                플랫폼 오른쪽 상단의 <strong>Settings &gt; Secrets</strong> 메뉴를 통해 API 키를 등록하면 즉시 정상 이용이 가능합니다.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: GEOGRAPHIC TRUTH */}
        {activeTab === "lesson1" && (
          <div className="space-y-8 animate-fade-in" id="lesson1-container">
            {/* Banner Overview */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md p-6 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2">1차시 핵심 이론</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">독도의 지리적 특성과 영역의 주권적 가치</h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
                독도가 우리 영토의 동쪽 끝임을 이해하는 논리적 열쇠는 명확한 물리적 지리사실에 기반합니다. 
                울릉도와 연결된 자연적 지리 축, 국가 영역 삼요소(영토, 영해, 영공)에 기초한 주격 행사, 그리고 우리 현대 행정 주소를 살펴봅니다.
              </p>
            </div>

            {/* Earth curvature calculator simulator widget */}
            <ObservabilitySimulator />

            {/* 1차시 Cards Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Three components of sovereignty */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-4">
                    <Compass className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">국가 영역의 삼요소와 실효적 지배</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    정부는 독도를 기점으로 완벽하고 독자적인 법률 관할권 및 실효 보전을 수행하고 있습니다.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 shrink-0 font-bold">영토:</span>
                      <span>경북 울릉군 울릉읍 독도리 196번지의 비옥한 천연 영유국 땅.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 shrink-0 font-bold">영해:</span>
                      <span>동도를 기선으로 12해리 범위 내 주권 해상(외선 선포 및 순시).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 shrink-0 font-bold">영공:</span>
                      <span>대한민국 방공식별구역(KADIZ)에 명확히 통합 등록 완료.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Interactive Road Address */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">독도의 주소와 고유 도로명</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    독도는 임의의 바위가 아닌 사람이 직접 거주하며 국가 인프라가 생생히 구동하는 도로명이 배당된 유인도입니다. 아래를 눌러 상세를 확인하세요.
                  </p>

                  <div className="space-y-3">
                    {/* Dongdo Card */}
                    <div 
                      onClick={() => setActiveAddressCard(activeAddressCard === "isabu" ? null : "isabu")}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        activeAddressCard === "isabu" 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>동도: 이사부길</span>
                        <ChevronRight className={`w-3.5 h-3.5 transform transition ${activeAddressCard === "isabu" ? "rotate-90" : ""}`} />
                      </div>
                      {activeAddressCard === "isabu" && (
                        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                          신라 자비왕 512년, 우산국을 한반도 영토로 최초 편입시킨 영웅 <strong>이사부 장군</strong>의 이름을 땄습니다. 독도경비대 청사, 독도 위령비, 독도 등대 및 부채바위 등이 기재되어 있습니다.
                        </p>
                      )}
                    </div>

                    {/* Seodo Card */}
                    <div 
                      onClick={() => setActiveAddressCard(activeAddressCard === "ahn" ? null : "ahn")}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        activeAddressCard === "ahn" 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>서도: 안용복길</span>
                        <ChevronRight className={`w-3.5 h-3.5 transform transition ${activeAddressCard === "ahn" ? "rotate-90" : ""}`} />
                      </div>
                      {activeAddressCard === "ahn" && (
                        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                          조선 숙종 시기 일본 돗토리번과 담판 지어 도해 금지령을 주도한 평민 어부 <strong>안용복</strong>의 이름을 헌정했습니다. 서도 주민 숙소와 중요 식수가 되는 '물골' 발원지가 소재합니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Modern Quick Stats */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-400/20 flex items-center justify-center mb-4">
                    <Info className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">독도의 현대 보전 활동</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    대한민국 국가기관들에 의한 빈틈없는 주권보전 통계입니다.
                  </p>
                  
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400">천연기념물 보존:</span>
                      <span className="text-slate-200">제336호 (1982년)</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400">평균 거주 인원:</span>
                      <span className="text-slate-200">경비대·공무원 약 40명</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-400">일일 평균 기온:</span>
                      <span className="text-teal-400 font-bold">동해안형 온난 온대</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: HISTORICAL SOURCES HISTOLOGY */}
        {activeTab === "lesson2" && (
          <div className="space-y-8 animate-fade-in" id="lesson2-container">
            {/* Banner Overview */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md p-6 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-[10px] bg-indigo-500 text-slate-950 font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2">2차시 핵심 이론</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">사료와 고지도로 규명하는 역사적 권원</h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
                한국과 일본의 수백 년 전 1차 역사서들은 독도가 조선의 영역임을 앞다투어 고백하고 있습니다. 
                중세 가공 없는 일등 공문서들을 교차 분석해 나가면서 냉철한 역사 진실을 탐색합니다.
              </p>
            </div>

            {/* Document Vault Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Filter and Clickable List list of sources */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      역사 공문서 등기소
                    </h3>
                    
                    {/* Target Filters */}
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-white/10 text-[10px]">
                      <button 
                        onClick={() => setSourceFilter("all")}
                        className={`px-2.5 py-1 rounded cursor-pointer transition ${sourceFilter === "all" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400"}`}
                      >
                        전체
                      </button>
                      <button 
                        onClick={() => setSourceFilter("KOR")}
                        className={`px-2.5 py-1 rounded cursor-pointer transition ${sourceFilter === "KOR" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400"}`}
                      >
                        한국
                      </button>
                      <button 
                        onClick={() => setSourceFilter("JPN")}
                        className={`px-2.5 py-1 rounded cursor-pointer transition ${sourceFilter === "JPN" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400"}`}
                      >
                        일본
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                    {filteredSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => setSelectedSourceId(source.id)}
                        className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 border transition cursor-pointer ${
                          selectedSourceId === source.id
                            ? "bg-white/10 border-emerald-500/40 shadow-inner"
                            : "bg-slate-950/30 border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${source.country === "KOR" ? "bg-blue-400" : "bg-rose-400"}`}></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{source.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{source.year}년</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{source.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 leading-relaxed font-semibold bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>한일 역사학적 기만 없는 완벽한 원천 대조 사본입니다.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Exhibit details screen */}
              <div className="lg:col-span-7 bg-white/10 border border-white/20 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md flex flex-col justify-between">
                <div>
                  
                  {/* Country Flag Badge indicator */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                      국제 보관소 검인 증적 고서
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        currentSource.country === "KOR"
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      }`}>
                        {currentSource.country === "KOR" ? "대한민국 기록문화유산" : "일본 고관 원본공증"}
                      </span>
                      <span className="text-[11px] bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded">
                        서기 {currentSource.year}년
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4 flex items-center gap-2">
                    {currentSource.title}
                  </h3>

                  {/* Highlight Quote (frosted slate quote block) */}
                  <div className="bg-slate-950/60 border-l-4 border-emerald-500 rounded-r-2xl p-5 mb-6 text-slate-200">
                    <p className="text-xs md:text-sm font-semibold leading-relaxed italic md:text-justify font-serif">
                      {currentSource.highlightQuote}
                    </p>
                  </div>

                  {/* Historical Significance Block */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        사료의 핵심 성격
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed md:text-justify">
                        {currentSource.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        영토권원 증명력과 위대한 의의
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed md:text-justify">
                        {currentSource.significance}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-400">
                    심층학습: <strong>안용복 사건(1696년)</strong>은 에도막부의 공식 도해금지령을 유도한 실질 교섭입니다.
                  </div>
                  
                  {/* Action Link to next 차시 */}
                  <button 
                    onClick={() => setActiveTab("lesson3")}
                    className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-bold transition cursor-pointer"
                  >
                    3차시 현대사로 건너가기 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: MODERN DYNAMICS & PEACE BRIDGE */}
        {activeTab === "lesson3" && (
          <div className="space-y-8 animate-fade-in" id="lesson3-container">
            {/* Banner Overview */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md p-6 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2">3차시 핵심 이론</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">현대 독도 갈등의 전개와 평화적 상생 방안</h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
                광복 이후 연합국의 영토 복원 조치들, 평화선 선포를 통한 어장 수호, 그리고 배타적 경제수역(EEZ) 제정과 '중간수역' 지정 과정을 탐색합니다. 
                감정적 주장을 이겨내는 학술 공동 교류의 평화적 가교를 설계합니다.
              </p>
            </div>

            {/* Timeline Layout */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm">
              <h3 className="text-base font-bold text-slate-200 mb-8 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                현대사 평화 수호의 이정표 역사식 타임라인
              </h3>

              <div className="relative border-l-2 border-white/10 pl-6 md:pl-8 space-y-10 py-2">
                
                {/* Milestone 1 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-teal-500 border-4 border-slate-950 w-6 h-6 rounded-full group-hover:scale-125 transition duration-300"></div>
                  <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 transition duration-300">
                    <span className="text-xs font-mono font-bold text-teal-400">1946년 1월 29일</span>
                    <h4 className="text-sm font-bold text-white mt-1">SCAPIN (연합국최고사령관지령) 제677호 발효</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      연합국 군정 사령부는 패망한 일본에게 식민 침탈지 반환을 촉구하면서, <strong>제주도, 울릉도, 그리고 독도(Liancourt Rocks)</strong>를 일본 국정 관리 대상 영역에서 영구히 전격 분리·배제하였습니다. 이는 현대 전후 영토 처리에서 독도가 대한민국의 통치 수렴 하에 귀속 완료되었음을 보장한 최고의 증거입니다.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-amber-500 border-4 border-slate-950 w-6 h-6 rounded-full group-hover:scale-125 transition duration-300"></div>
                  <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 transition duration-300">
                    <span className="text-xs font-mono font-bold text-amber-400">1952년 1월 18일</span>
                    <h4 className="text-sm font-bold text-white mt-1">이승만 대통령의 '평화선 선포 (Rhee Line)'</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      샌프란시스코 조약 발효를 앞둔 절정의 마찰 시기 속에서, 대한민국 정부는 인접 해양의 독자적 수역 한계 평화 선언을 공표해 독도 영유권 수호를 선엄했습니다. 수자원과 주권 수호의 실질 울타리가 되었습니다.
                    </p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-emerald-500 border-4 border-slate-950 w-6 h-6 rounded-full group-hover:scale-125 transition duration-300"></div>
                  <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 transition duration-300">
                    <span className="text-xs font-mono font-bold text-emerald-400">1953~1956년</span>
                    <h4 className="text-sm font-bold text-white mt-1">울릉도 의병들의 '독도의용수비대' 수훈 활동</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      6.25 한국 전쟁의 국난과 외교 혼란기를 틈탄 일본 순시선의 푯말 침탈 야욕을 막기 위해, 고(故) 홍순칠 대장과 울릉도의 청년 제대 군인등 33인의 민간 영웅들이 자발적으로 결사 수비대를 결성했습니다. 이들은 가짜 나무 주둔 박격포를 만들어 굳건히 방위 전선을 치며 독도를 수호했습니다.
                    </p>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-indigo-500 border-4 border-slate-950 w-6 h-6 rounded-full group-hover:scale-125 transition duration-300"></div>
                  <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 transition duration-300">
                    <span className="text-xs font-mono font-bold text-indigo-400">1998년 9월</span>
                    <h4 className="text-sm font-bold text-white mt-1">신한일어업협정 서명과 '중간수역' 과제 발생</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      유엔해양법협약 발효에 따른 200해리 배타적 경제수역(EEZ)의 한일 상호 충돌 상황에서, 한시적 어장 공유를 위해 독도를 둘러싼 과도기적 중첩 '중간수역' 제도를 획정하였습니다. 이 타협은 주권 희석 자극의 논쟁을 낳기도 하였으며, 2005년 시마네현의 외곡 '다케시마의 날' 강행 등 현대 고조 갈등 대응의 거점이 되고 있습니다.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ENGAING WORKSHOP (AI JOINT TEXTBOOK REVIEW) */}
        {activeTab === "lesson4" && (
          <div className="space-y-8 animate-fade-in" id="lesson4-container">
            {/* Banner Overview */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md p-6 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-[10px] bg-purple-500 text-slate-950 font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2">실습 활동 마당</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">한·일 평화 공동 역사 교과서 집필관</h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
                한국과 일본의 미래 청소년들이 감정적 분쟁 주장을 극복하고 배운 사료(세종실록지리지, 태정관지령 등)를 바탕으로 객관적인 평화 지향 10줄 서술문을 함께 집필해 봅니다. 
                작성한 초안에 대해 AI 역사 위원의 실시간 심층 검인 피드백과 교정을 받아보세요!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Input fields column */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    교과서 소서단 모둠 양식
                  </h3>
                  
                  {/* Load prefilled draft template buttons */}
                  <button
                    onClick={handleLoadTemplate}
                    className="text-[10px] font-bold text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    예시 초안 불러오기
                  </button>
                </div>

                {/* Group authors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">모둠원 1 (한국 학생)</label>
                    <input
                      type="text"
                      placeholder="예: 이지호"
                      value={studentKOR}
                      onChange={(e) => setStudentKOR(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">모둠원 2 (일본 학생)</label>
                    <input
                      type="text"
                      placeholder="예: 사토 하루키"
                      value={studentJPN}
                      onChange={(e) => setStudentJPN(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Chapter Proposed Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">우리가 제안하는 단원 제목</label>
                  <input
                    type="text"
                    placeholder="예: 평화적 고증을 기반으로 한 동해의 조화"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Joint written draft area with char count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">공동 집필 초안문 (권장 10줄 이내)</label>
                    <span className="text-[9px] text-slate-500 font-mono">{draftContent.length} / 800 자</span>
                  </div>
                  <textarea
                    placeholder="여기에 한일 고문서(예: 세종실록지리지, 태정관지령 등) 중 최소 2개 이상을 증거로 제시하고, 감정적인 비난을 배제한 채 미래 상생 평화의 희망을 담아 한글로 10줄 이내 서술문을 작성하세요..."
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs text-white leading-relaxed focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                  <div className="text-[10px] text-slate-400/80 leading-relaxed pt-1 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>작성 시 일방적인 비방을 빼고 역사적 근거 위주의 팩트를 채우면 더 가점됩니다.</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleReviewDraft}
                  disabled={isReviewing || !draftContent.trim()}
                  className={`w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isReviewing || !draftContent.trim()
                      ? "bg-white/5 border border-white/15 text-slate-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/10"
                  }`}
                >
                  {isReviewing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      AI 역사 위원회 심사 처리 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      우리 교과서 AI 정밀 검수 요청
                    </>
                  )}
                </button>

                {/* Internal input errors */}
                {reviewError && (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                    {reviewError}
                  </div>
                )}
              </div>

              {/* AI review results panel column */}
              <div className="lg:col-span-7 bg-white/10 border border-white/20 rounded-[2.5rem] p-6 backdrop-blur-md flex flex-col justify-between" id="evaluation-screen">
                
                {!reviewResult && !isReviewing && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-[2rem] bg-slate-950/30 my-auto min-h-[460px]">
                    <Sparkles className="w-12 h-12 text-slate-500 mb-4 animate-bounce" />
                    <h4 className="text-sm font-bold text-white">대기 평가 화면</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2">
                      왼쪽 서식에 한일 공동 평화서 단원 제목명, 학생명 및 10줄 정도의 내용 초안을 적고 정밀 심의를 가하시면 AI 비평 위원회의 전문 비평과 점수를 수령합니다.
                    </p>
                    <button
                      onClick={handleLoadTemplate}
                      className="mt-4 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/35 rounded-xl text-xs transition cursor-pointer"
                    >
                      지금 샘플 서식 자동완성해보기
                    </button>
                  </div>
                )}

                {isReviewing && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 my-auto min-h-[460px]">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-indigo-400/20 border-b-indigo-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
                    </div>
                    <h4 className="text-sm font-bold text-purple-300">AI 보관소 사료 대조 중</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2 animate-pulse">
                      신증동국여지승람, 삼국접양지도 및 태정관지령 등 수백만 역사 팩트 코퍼스와 검사를 진행하고 있습니다. 소요 시간 약 3초...
                    </p>
                  </div>
                )}

                {reviewResult && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Header Score Gauges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Gauge Fact Score */}
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" strokeWidth="4" 
                              strokeDasharray={`${2 * Math.PI * 20}`} 
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - reviewResult.factScore / 100)}`} 
                            />
                          </svg>
                          <span className="absolute text-xs font-mono font-bold text-emerald-400">{reviewResult.factScore}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">역사 고증 신뢰도</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">명시한 고문서 존재 부합 점수</p>
                        </div>
                      </div>

                      {/* Gauge Peace Forward Score */}
                      <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <circle cx="24" cy="24" r="20" fill="none" stroke="#6366f1" strokeWidth="4" 
                              strokeDasharray={`${2 * Math.PI * 20}`} 
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - reviewResult.peaceScore / 100)}`} 
                            />
                          </svg>
                          <span className="absolute text-xs font-mono font-bold text-indigo-400">{reviewResult.peaceScore}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">상상 화해 및 평화 지수</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">비난 배제 중심 미래가치 전개</p>
                        </div>
                      </div>
                    </div>

                    {/* Requirement Checks */}
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">사료 충족 요건 (2개 이상 고증):</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {reviewResult.sufficientSources ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> 통과
                            </span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> 사료부족 (기준 미충족)
                            </span>
                          )}
                          <span className="text-slate-300 font-mono text-[10px]">{reviewResult.detectedSources.length}개 발견</span>
                        </div>
                        {reviewResult.detectedSources.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reviewResult.detectedSources.map((s, idx) => (
                              <span key={idx} className="bg-white/5 border border-white/5 text-slate-300 rounded px-1.5 py-0.2 text-[9px] font-mono">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">원고 분량 기준 (대략 10줄 이내):</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {reviewResult.lineLimitPassed ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> 적합
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> 분량 다소 하향조정
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 leading-tight mt-1.5">간결한 교과서 편성을 위해 알맞은 1페이지 분량에 맞춰 평가를 구성합니다.</p>
                      </div>
                    </div>

                    {/* Review Feedback General Essay */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">평가위원 학술 및 평화 지성 총평</h4>
                      <p className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed md:text-justify max-h-36 overflow-y-auto">
                        {reviewResult.feedbackKorean}
                      </p>
                    </div>

                    {/* Joint co-author JPN Viewpoint statement */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        일본측 집필 공동 파트너의 교감 의견
                      </h4>
                      <p className="bg-purple-950/15 border border-purple-500/15 p-4 rounded-2xl text-xs text-purple-200 leading-relaxed italic md:text-justify">
                        “ {reviewResult.coAuthorJapaneseViewpoint} ”
                      </p>
                    </div>

                    {/* Recommended Revision Text Block */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        AI 수집정리 교정본 추천 개선안
                      </h4>
                      <div className="bg-emerald-950/15 border border-emerald-500/15 p-4 rounded-2xl text-xs text-emerald-200 leading-relaxed tracking-wide md:text-justify select-all font-sans">
                        {reviewResult.revisionKorean}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">박스를 더블 클릭해 서식을 복사해 학생 보고서에 활용해 보세요.</span>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVE QUIZ */}
        {activeTab === "quiz" && (
          <div className="space-y-8 animate-fade-in" id="quiz-container">
            {/* Banner Overview */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md p-6 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-[10px] bg-indigo-500 text-slate-950 font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider mb-2">지구 시민 성찰 마당</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">독도 평화 수호 지성 가치성 평가</h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
                앞선 1~3차시를 바탕으로 독도의 지리학적 수치, 역사적 고증 유산, 그리고 해법 전제에 올바른 판단력을 기르는 확인 학습 문항입니다. 
                감정을 뛰어넘는 완벽한 논변의 주체로 거듭나 보세요.
              </p>
            </div>

            {/* Quiz Content Card */}
            {!quizCompleted ? (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm max-w-3xl mx-auto" id="quiz-card">
                
                {/* State Index */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                    평화 주권 에센셜 모의고사
                  </span>
                  <span className="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-mono font-bold">
                    문제 {currentQuizIndex + 1} / {DOKDO_QUIZ.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-8">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${((currentQuizIndex + 1) / DOKDO_QUIZ.length) * 100}%` }}
                  ></div>
                </div>

                {/* Question Text */}
                <h3 className="text-base md:text-lg font-bold text-slate-100 leading-relaxed mb-6 md:text-justify">
                  {DOKDO_QUIZ[currentQuizIndex].question}
                </h3>

                {/* Option list buttons */}
                <div className="space-y-3">
                  {DOKDO_QUIZ[currentQuizIndex].options.map((option, idx) => {
                    
                    let bgBorderClass = "bg-slate-950/40 border-white/5 hover:bg-white/5 text-slate-300";
                    
                    if (selectedAnswer === idx) {
                      bgBorderClass = "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold";
                    }

                    if (isAnswerSubmitted) {
                      if (idx === DOKDO_QUIZ[currentQuizIndex].correctAnswer) {
                        bgBorderClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                      } else if (selectedAnswer === idx) {
                        bgBorderClass = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                      } else {
                        bgBorderClass = "bg-slate-950/20 border-white/5 opacity-50 text-slate-400";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerClick(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-2xl border text-xs leading-relaxed transition flex items-center justify-between cursor-pointer ${bgBorderClass}`}
                      >
                        <span className="flex-1 pr-4">{idx + 1}. {option}</span>
                        
                        <span className="shrink-0 font-bold">
                          {isAnswerSubmitted && idx === DOKDO_QUIZ[currentQuizIndex].correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          )}
                          {isAnswerSubmitted && selectedAnswer === idx && idx !== DOKDO_QUIZ[currentQuizIndex].correctAnswer && (
                            <X className="w-4 h-4 text-rose-400" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Next Footer actions */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                  
                  {/* Feedback explanation block */}
                  <div className="flex-1">
                    {isAnswerSubmitted && (
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed transition-all animate-fade-in md:text-justify">
                        <h5 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                          가치 해설 해설
                        </h5>
                        <p>{DOKDO_QUIZ[currentQuizIndex].explanation}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    {!isAnswerSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className={`px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
                          selectedAnswer === null
                            ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-500/10"
                        }`}
                      >
                        정답 제출
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuiz}
                        className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition"
                      >
                        {currentQuizIndex < DOKDO_QUIZ.length - 1 ? "다음 문항" : "최종 결과 수령"}
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              /* Quiz completed screen (dashboard report card style) */
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-[2.5rem] p-8 max-w-2xl mx-auto text-center space-y-6 animate-fade-in" id="quiz-completed-panel">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Award className="w-8 h-8 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white">독도 가치 성찰 자각 평가 완료</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    동아시아 공동체의 평화 공전 문명 자각 능력을 지성 대면 입증하셨습니다.
                  </p>
                </div>

                {/* Score stats block */}
                <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6 max-w-md mx-auto grid grid-cols-2 gap-4">
                  <div className="border-r border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">최종 취득 점수</span>
                    <span className="block text-3xl font-black text-white mt-1">
                      <span className="text-emerald-400">{quizScore * 20}</span> / 100 점
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">정답률</span>
                    <span className="block text-3xl font-black text-white mt-1">
                      {(quizScore / DOKDO_QUIZ.length) * 100} %
                    </span>
                  </div>
                </div>

                {/* Evaluation statement based on score */}
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto italic">
                  {quizScore === DOKDO_QUIZ.length ? (
                    "완벽한 만점입니다! 한일 간 사료의 지성적 논할거리를 모두 이해하고 있으며, 동해의 평화적 조화 수립을 주도할 준비가 된 숭고한 평화 전도 시민입니다."
                  ) : quizScore >= 3 ? (
                    "우수한 지적 수준을 갖추고 있습니다. 독도의 물리적 육안관측, 현대 어업수역, 그리고 1696년 안용복과 공문서 입지들을 올바르게 고증하고 있습니다."
                  ) : (
                    "교육 내용을 천천히 다시 살펴보며 팩트 유산을 재검인해 보는 편이 지식 함양에 전제됩니다. 아래 버튼을 눌러 다시 언제든 참여해 보세요."
                  )}
                </p>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    처음부터 다시 도전
                  </button>
                  <button
                    onClick={() => setActiveTab("lesson4")}
                    className="px-6 py-3 bg-gradient-to-tr from-indigo-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    공동 교과서 양식 집필하러 가기
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
