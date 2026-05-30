import { useState } from "react";
import { Eye, EyeOff, Sun, CloudRain, Shield, Landmark } from "lucide-react";

export default function ObservabilitySimulator() {
  const [weather, setWeather] = useState<"clear" | "foggy">("clear");
  const [altitude, setAltitude] = useState<number>(500); // 0 to 1000m
  const [viewpoint, setViewpoint] = useState<"ullung" | "oki" | "korea_mainland">("ullung");

  // Heights
  // Dokdo peak (Seodo is 168.5m, Dongdo is 98.6m, let's take peak 168.5m)
  const DOKDO_HEIGHT = 168.5;
  
  // Distances
  const DISTANCES = {
    ullung: 87.4,
    oki: 157.5,
    korea_mainland: 216.8
  };

  const VIEWPOINT_NAMES = {
    ullung: "울릉도 고지대 (Sari/석포마을)",
    oki: "일본 오키섬 최고봉 (Daimanjisan 608m)",
    korea_mainland: "한반도 동해안 (죽변/울진)"
  };

  // Maximum visual line-of-sight calculation
  // Formula: D_max (km) = 3.57 * (sqrt(h_observer) + sqrt(h_target))
  const observerHeight = viewpoint === "ullung" ? altitude : viewpoint === "oki" ? 608 : 150;
  const currentDistance = DISTANCES[viewpoint];
  const maxLineOfSight = parseFloat((3.57 * (Math.sqrt(observerHeight) + Math.sqrt(DOKDO_HEIGHT))).toFixed(1));
  
  const isPhysicallyPossible = maxLineOfSight >= currentDistance;
  const isVisible = isPhysicallyPossible && weather === "clear";

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl text-slate-100" id="observability-sim">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full inline-block mb-2">실습교구 1</span>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            지리적 인지 과학 시뮬레이터 (육안 관측성)
          </h3>
          <p className="text-xs text-slate-400 mt-1">지구 곡률과 거리에 기반한 고대 거주민의 생활권 확장 타당성 검증</p>
        </div>

        {/* Viewpoint Tabs */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewpoint("ullung")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
              viewpoint === "ullung" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            울릉도 출발 (87.4km)
          </button>
          <button
            onClick={() => setViewpoint("oki")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
              viewpoint === "oki" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            오키섬 출발 (157.5km)
          </button>
          <button
            onClick={() => setViewpoint("korea_mainland")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
              viewpoint === "korea_mainland" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            한반도 내륙 (216.8km)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Simulator controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">시뮬레이션 환경 변수</h4>
            
            {/* Weather toggle */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">대기 환경 (가시거리 변수)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setWeather("clear")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                    weather === "clear"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  맑음
                </button>
                <button
                  onClick={() => setWeather("foggy")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                    weather === "foggy"
                      ? "bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold"
                      : "bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  흐림/안개
                </button>
              </div>
            </div>

            {/* Altitude Slider for Ullungdo */}
            {viewpoint === "ullung" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">관측 위치 고도 (기울기)</span>
                  <span className="text-amber-400 font-mono font-bold">{altitude}m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="984"
                  value={altitude}
                  onChange={(e) => setAltitude(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 select-none">
                  <span>해안선 (5m)</span>
                  <span>석포마을 성인봉 (984m)</span>
                </div>
              </div>
            )}

            {/* Fixed Heights for others */}
            {viewpoint === "oki" && (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400 leading-relaxed mb-1">
                  오키섬 최고지인 <strong className="text-slate-200 font-bold">다이만지산 (大萬二山, 608m)</strong> 기준으로 고정됩니다.
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  기하학적으로 섬의 최정상 망루에 도달하더라도 지구 만곡의 소멸을 상쇄하기 위해 설정되었습니다.
                </div>
              </div>
            )}

            {viewpoint === "korea_mainland" && (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  한반도 죽변 등대 및 구름 봉우리고지대 고유추정 고도인 <strong className="text-slate-200 font-bold">150m</strong>에 고정됩니다.
                </div>
              </div>
            )}
          </div>

          {/* Core math telemetry */}
          <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">구면 기하학 연산 (Horizon Math)</h4>
            <div className="space-y-2 font-mono text-xs text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>관측지 고도 (h₁):</span>
                <span className="text-slate-200">{observerHeight}m</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>독도 최고점 (h₂):</span>
                <span className="text-slate-200">{DOKDO_HEIGHT}m</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>수학적 최대가시선 (D_max):</span>
                <span className={`font-bold ${isPhysicallyPossible ? "text-emerald-400" : "text-rose-400"}`}>
                  {maxLineOfSight} km
                </span>
              </div>
              <div className="flex justify-between">
                <span>실제 기하학적 거리 (D):</span>
                <span className="text-slate-200 font-bold">{currentDistance} km</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg italic">
                계산공식: D_m = 3.57 × (√h₁ + √h₂)
              </div>
            </div>
          </div>
        </div>

        {/* Visual telemetry screen */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950/50 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          {/* Simulated ocean sky view */}
          <div className="relative h-60 w-full rounded-2xl bg-gradient-to-b from-sky-950/80 via-indigo-950/80 to-emerald-950/85 border border-white/10 flex flex-col justify-between p-4 overflow-hidden shadow-inner">
            
            {/* Distant Sea Horizon Grid Line */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none opacity-20"></div>

            {/* Weather status overlay */}
            {weather === "foggy" && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] transition duration-500 flex flex-col items-center justify-center text-center p-4 z-20">
                <CloudRain className="w-10 h-10 text-sky-300 animate-pulse mb-2" />
                <p className="text-xs text-sky-200 font-semibold">동해 해상에 해무 및 난층운이 가득 차 기상 시계가 상실되었습니다.</p>
                <p className="text-[10px] text-slate-400 mt-1">빛의 직진성이 안개 입자에 반사 산란되어 실질적으로 보이지 않습니다.</p>
              </div>
            )}

            {/* Atmosphere and Sun */}
            <div className="flex justify-between items-start relative z-10">
              <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-white/5 backdrop-blur">
                출발 관측지: {VIEWPOINT_NAMES[viewpoint]}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px] border border-white/5 backdrop-blur">
                {isVisible ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    체감 시정 확보 (관측 성공)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                    관측 실패 (식별 불능)
                  </span>
                )}
              </div>
            </div>

            {/* Horizon and Earth curvature view */}
            <div className="relative w-full h-24 mb-4 flex items-end justify-center">
              {/* Observer silhouette */}
              <div className="absolute left-6 bottom-0 text-center z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mb-1">
                  <span className="text-xs font-bold text-amber-400">유</span>
                </div>
                <span className="text-[8px] text-slate-400">관측자</span>
              </div>

              {/* Distant Dokdo Drawing */}
              {isVisible ? (
                <div className="absolute right-16 bottom-0 text-center animate-fade-in z-10 flex flex-col items-center">
                  {/* Dokdo silhouette */}
                  <div className="flex items-end gap-1 select-none">
                    {/* Seodo */}
                    <div className="w-12 h-6 bg-emerald-600 rounded-t-full border-t-2 border-emerald-400 flex items-center justify-center shadow-lg transform translate-y-1 hover:-translate-y-1 transition duration-500">
                      <span className="text-[8px] text-slate-100 font-bold">서도</span>
                    </div>
                    {/* Rock block */}
                    <div className="w-3 h-2 bg-emerald-700 rounded-t"></div>
                    {/* Dongdo */}
                    <div className="w-9 h-5 bg-emerald-600 rounded-t-full border-t-2 border-emerald-400 flex items-center justify-center shadow-md transform translate-y-2 hover:-translate-y-1 transition duration-500">
                      <span className="text-[8px] text-slate-100 font-bold">동도</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider mt-1.5">독도 (섬 윤곽 전선 선명)</span>
                </div>
              ) : (
                <div className="absolute right-16 bottom-0 opacity-10 select-none flex flex-col items-center">
                  <div className="flex items-end gap-1">
                    <div className="w-12 h-2 bg-slate-700 rounded-t"></div>
                    <div className="w-9 h-1 bg-slate-700 rounded-t"></div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">수평선 밑에 잠김 (물리적 한계)</span>
                </div>
              )}

              {/* Connect line-of-sight vector */}
              {weather === "clear" && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: "96px" }}>
                  <path
                    d={`M 40 70 Q 200 ${isPhysicallyPossible ? '30' : '90'} 380 ${isPhysicallyPossible ? '70' : '95'}`}
                    fill="none"
                    stroke={isPhysicallyPossible ? "#f59e0b" : "#f43f5e"}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                </svg>
              )}

              {/* Earth Horizon Curvature Base line */}
              <div className="absolute bottom-0 w-full h-1 bg-sky-400/30 opacity-70 border-b border-sky-400/50"></div>
            </div>
            
            {/* Distance label */}
            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 bg-slate-950/90 text-[10px] px-2.5 py-0.5 rounded border border-white/5 text-slate-300 font-mono">
              관측거리: {currentDistance}km
            </div>
          </div>

          {/* Geometrical Explanation */}
          <div className="mt-4 p-4 bg-slate-950/40 rounded-xl border border-white/5">
            <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              지리적 사실 검인과 역사적 의의
            </h5>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {viewpoint === "ullung" ? (
                altitude >= 120 ? (
                  <>
                    울릉도 고도 <strong className="text-amber-400">{altitude}m</strong>에서는 기하학적 최대 시정이{" "}
                    <strong className="text-slate-100">{maxLineOfSight}km</strong>로 독도까지의 거리(87.4km)를 훨씬 초과합니다. 
                    따라서 맑은 날에는 울릉도 높은 산봉우리에 오르면 인간의 맨눈으로 독도의 상부 봉우리가 뚜렷이 수평선 너머로 목격됩니다. 
                    이는 조선 초기 세종실록지리지에 기록된 <em>'날씨가 맑으면 바라볼 수 있다'</em>는 서술이 신뢰할 수 있는 직접 관찰 결과임을 물리적으로 증명합니다.
                  </>
                ) : (
                  <>
                    해안 수준의 극히 낮은 저도(<strong className="text-amber-500">{altitude}m</strong>)에서는 시정 거리가 수평선에 가려 다소 제약이 있을 수 있습니다. 가시 범위를 더 늘리기 위해 고도 조절 손잡이를 올려 울릉도 고지대로 올라가 보세요.
                  </>
                )
              ) : viewpoint === "oki" ? (
                <>
                  일본 오키섬에서는 가장 고도가 높고 날이 청명하더라도 최대 가시선이{" "}
                  <strong className="text-rose-400">{maxLineOfSight}km</strong>에 불과해 독도까지의 물리적 거리(157.5km)에 미치지 못합니다. 
                  즉, 독도는 <strong className="text-rose-400">지하 수평선(지구 뒤편)으로 침수</strong>되어 오키섬에서는 물리적으로 결코 볼 수 없습니다. 
                  고대 일본인들의 생활 환경에서 독도는 인지 범주 밖이었으며, 의도적 항해를 거친 간접적인 군사·어업 외지 개척 영역으로 취급되었음이 과학적 사실로 증명되었습니다.
                </>
              ) : (
                <>
                  한반도 본토 내륙 최동단(울진 죽변)에서 독도까지 거리는 216.8km로 수평선 가시 거리인 약 150km를 초월합니다. 따라서 본토에서 육안 관측은 불가능하며, 
                  근방에 자리한 <strong className="text-amber-300">중간 거점인 울릉도를 중심축</strong>으로 삼아 독도를 지속적이고도 유기적인 행정 주권으로 관리해 왔음을 시시합니다.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
