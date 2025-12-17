import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DocumentIntelligence, Question, EvaluationResult, LearnerMemory, Rubric } from "../types";
import { SYSTEM_PROMPT_ANALYSIS, SYSTEM_PROMPT_EVALUATION } from "../constants";

// Initialize Gemini Client
// We prioritize the user-specified GEMINI_API_KEY, falling back to the system API_KEY
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// Schema Definitions for JSON Mode
const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    intelligence: {
      type: Type.OBJECT,
      properties: {
        core_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
        implicit_assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        cross_section_links: { type: Type.ARRAY, items: { type: Type.STRING } },
        difficulty_items: { 
          type: Type.ARRAY, 
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              score: { type: Type.NUMBER }
            }
          }
        }
      }
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question_text: { type: Type.STRING },
          targets: { type: Type.ARRAY, items: { type: Type.STRING } },
          rubric: {
            type: Type.OBJECT,
            properties: {
              key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              depth_markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              common_misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    }
  }
};

const evaluationResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score_band: { type: Type.STRING, enum: ['Novice', 'Competent', 'Proficient', 'Master', 'Visionary'] },
    score_numerical: { type: Type.NUMBER },
    strength_analysis: { type: Type.STRING },
    weakness_analysis: { type: Type.STRING },
    personalized_suggestion: { type: Type.STRING },
    updated_memory: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  }
};

export const geminiService = {
  /**
   * Phase 1: Deep Analysis
   * Uses Gemini 3.0 Pro with Thinking Budget for maximum reasoning capabilities.
   * This runs ONCE per document.
   */
  analyzeDocument: async (text: string): Promise<{ intelligence: DocumentIntelligence; questions: Question[] }> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // High reasoning model
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT_ANALYSIS }] },
          { role: 'user', parts: [{ text: `DOCUMENT TEXT:\n${text}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
          thinkingConfig: {
             thinkingBudget: 16000 // High budget for deep analysis
          }
        }
      });

      if (!response.text) throw new Error("No response from Gemini");
      const rawData = JSON.parse(response.text);

      // Transform API response to match App Interface
      // We requested difficulty_items (array) to satisfy Schema types, but App uses difficulty_map (record)
      const intelligence: DocumentIntelligence = {
        core_themes: rawData.intelligence?.core_themes || [],
        implicit_assumptions: rawData.intelligence?.implicit_assumptions || [],
        cross_section_links: rawData.intelligence?.cross_section_links || [],
        difficulty_map: {}
      };

      if (rawData.intelligence?.difficulty_items && Array.isArray(rawData.intelligence.difficulty_items)) {
        rawData.intelligence.difficulty_items.forEach((item: any) => {
          if (item.topic && item.score) {
            intelligence.difficulty_map[item.topic] = item.score;
          }
        });
      }

      return {
        intelligence,
        questions: rawData.questions || []
      };

    } catch (error) {
      console.error("Analysis Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Evaluation
   * Uses Gemini 2.5 Flash for speed, or Pro for depth. 
   * We use Pro here to maintain the "Tutor" persona quality.
   * Crucially: DOES NOT send the full document again. Only the rubric.
   */
  evaluateAnswer: async (
    question: Question,
    userAnswer: string,
    memory: LearnerMemory
  ): Promise<EvaluationResult> => {
    try {
      const contextPayload = {
        question: question.question_text,
        rubric: question.rubric,
        learner_memory: memory,
        student_answer: userAnswer
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT_EVALUATION }] },
          { role: 'user', parts: [{ text: JSON.stringify(contextPayload) }] }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: evaluationResponseSchema,
          thinkingConfig: {
             thinkingBudget: 2048 // Lower budget for evaluation, just needs to apply rubric
          }
        }
      });

      if (!response.text) throw new Error("No response from Gemini");
      return JSON.parse(response.text) as EvaluationResult;

    } catch (error) {
      console.error("Evaluation Error:", error);
      throw error;
    }
  }
};