import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash on startup if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for checking API Key availability safely without exposing it
app.get("/api/config/status", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Prompt review API endpoint
app.post("/api/gemini/review", async (req, res) => {
  try {
    const { draft, authorKorean, authorJapanese, lessonTitle } = req.body;

    if (!draft || String(draft).trim().length < 5) {
      return res.status(400).json({ error: "초안이 너무 짧거나 비어 있습니다." });
    }

    const ai = getAiClient();

    const systemInstruction = `
당신은 대한민국과 일본의 청소년들이 함께 참여하는 '한·일 평화 공동 역사 교과서 서술' 활동의 전문 평가위원이자 AI 공동 집필 보조원입니다.
학생들이 작성한 10줄 이내의 독도 서술문 초안을 분석하여, 다음 객관적 기준에 부합하는지 엄격하고 건설적인 다국어(한국어 중심) 피드백과 평가 점수를 매겨야 합니다.

[작성 조건 분석 기준]
1. 사료 제시 기준 (반드시 아래 사료 중 최소 2개 이상이 서술문에 고증적 근거로 정확히 등장해야 함):
   - 한국 사료: 세종실록지리지(1454년), 신증동국여지승람(1531년), 만기요람(1808년), 대한제국 칙령 제41호(1900년)
   - 일본 관찬 사료/지도: 은주시청합기(1667년), 조선국교제시말내탐서(1870년), 태정관지령(1877년), 개정일본여지로정전도(1779년), 삼국접양지도(1785년)
2. 서술 방향성: 일방적인 감정적 배타성 및 비난을 철저히 배제하고, 사실(Fact) 중심의 서술과 양국의 미래지향적인 평화 공동체 관점(상호 존중, 협력, 바다의 평화)이 강조되는가?
3. 분량 및 형식: 10줄 이내의 간결하고 정제된 서술형 문장인가?

분석 결과를 반드시 아래의 JSON 형식으로 응답해야 합니다. 다른 서설이나 마크다운 외곽 기호 없이 순수한 JSON으로만 반환해 주세요:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
학생 모둠: ${authorKorean || "한국 학생"} & ${authorJapanese || "일본 학생"}
단원 제목: ${lessonTitle || "공동 교과서 - 독도 서술 제안서"}
서술문 초안:
"""
${draft}
"""

위 초안을 객관적 지표로 심사하고, 피드백을 JSON으로 생성하십시오.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "sufficientSources",
            "detectedSources",
            "missingSourcesCount",
            "factScore",
            "peaceScore",
            "lineLimitPassed",
            "feedbackKorean",
            "revisionKorean",
            "coAuthorJapaneseViewpoint"
          ],
          properties: {
            sufficientSources: {
              type: Type.BOOLEAN,
              description: "사료가 최소 2개 이상 정확히 언급되었는가 여부 (true/false)",
            },
            detectedSources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "학생 초안에서 감지된 역사 사료 이름 리스트",
            },
            missingSourcesCount: {
              type: Type.INTEGER,
              description: "2개 기준에서 부족한 소스 개수 (모두 충족 시 0)",
            },
            factScore: {
              type: Type.INTEGER,
              description: "역사적 사실성 및 고증 신뢰도 점수 (0 ~ 100)",
            },
            peaceScore: {
              type: Type.INTEGER,
              description: "양국의 상호존중 및 미래지향적 평화 지향성 점수 (0 ~ 100)",
            },
            lineLimitPassed: {
              type: Type.BOOLEAN,
              description: "대략 10줄 이내 서술 기준을 넘기지 않고 충족하는지 여부 (true/false)",
            },
            feedbackKorean: {
              type: Type.STRING,
              description: "초안의 장점과 보완이 필요한 부분을 상세하고 따뜻하게 짚어주는 비평가 총평 (한국어)",
            },
            revisionKorean: {
              type: Type.STRING,
              description: "학생들의 초안을 원형 그대로 최대한 보존하되, 역사적 고증을 보강하고 평화 조화로운 문체로 가다듬은 한글 추천 개선안",
            },
            coAuthorJapaneseViewpoint: {
              type: Type.STRING,
              description: "일본 친구의 입장에서 보았을 때 이 서술문에서 감화되거나 기여할 수 있는 평화적 피드백과 동의 구절 (예: '정확한 고문서 근거 덕분에 배타 감정이 빠져 설득력 있게 느껴집니다.')",
            }
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Gemini 분석 중 오류가 발생했습니다." });
  }
});

// Setup Vite Dev Server / Static Assets Host
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
