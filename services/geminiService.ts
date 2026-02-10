import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ChatMessage, GeneratedRoadmapResponse, AppNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the Tutor
const TUTOR_SYSTEM_INSTRUCTION = `
You are an expert technical tutor embedded in the DevPath.ai learning platform.
Your goal is to help users understand complex technical concepts from their current roadmap.
You should be encouraging, concise, and provide code examples where relevant.
If the user asks about the currently selected node, focus your answer on that specific topic.
`;

export const chatWithTutor = async (
  history: ChatMessage[],
  currentMessage: string,
  contextNode?: AppNode | null
) => {
  const model = "gemini-3-pro-preview";
  
  let systemContext = TUTOR_SYSTEM_INSTRUCTION;
  if (contextNode) {
    systemContext += `\nThe user is currently viewing the node: "${contextNode.data.label}". Description: "${contextNode.data.description}". Focus answers on this context if the query is ambiguous.`;
  }

  try {
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemContext,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      })),
    });

    const result = await chat.sendMessageStream({ message: currentMessage });
    return result;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const generateRoadmapAI = async (topic: string): Promise<GeneratedRoadmapResponse> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Create a comprehensive learning roadmap for the topic: "${topic}".
    The output must be a valid JSON object representing a tree of concepts.
    
    Structure Requirements:
    - Root node should be the main topic or starting point.
    - Each node should have an 'id' (unique string), 'label', 'description', 'parentId' (string or null for root), and 'resources' (array of {title, url, type}).
    - 'resources' should be real or plausible search queries/titles.
    - Ensure there are at least 8-12 nodes to make a useful roadmap.
    - Organize the parentId relationships to create a logical progression.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    nodes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                label: { type: Type.STRING },
                                description: { type: Type.STRING },
                                parentId: { type: Type.STRING, nullable: true },
                                resources: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            url: { type: Type.STRING },
                                            type: { type: Type.STRING, enum: ["article", "video", "documentation"] }
                                        }
                                    }
                                }
                            },
                            required: ["id", "label", "description", "resources"]
                        }
                    }
                }
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedRoadmapResponse;

  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    throw error;
  }
};
