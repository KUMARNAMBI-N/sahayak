import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * Gemini (and most LLMs) sometimes wrap JSON in fenced ```json blocks
 * or add extra prose. This helper finds the first {...} block and parses it.
 */
function safeJSONParse(raw: string) {
  // Remove common Markdown code-fence wrappers
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  // Grab the first {...} block to be extra safe
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error("No valid JSON object found in model response.")
  }

  return JSON.parse(match[0])
}

// Initialize Gemini AI with the API key
const getGeminiAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured")
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function generateStory(prompt: string, language: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const enhancedPrompt = `Create an educational story in ${language} language about: ${prompt}
    
    Requirements:
    - Write in ${language} script and language
    - Make it culturally relevant to Indian context
    - Include educational content suitable for school children
    - Keep it engaging and age-appropriate
    - Length: 200-300 words
    - Include moral or learning outcome
    
    Topic: ${prompt}`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating story:", error)
    throw new Error("Failed to generate story. Please check your API key and try again.")
  }
}

export async function generateWorksheet(content: string, grade: string, subject?: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Create an educational worksheet for Grade ${grade} students based on the following content:

    Content: ${content}
    Grade Level: ${grade}
    Subject: ${subject || "General"}
    
    Requirements:
    - Create age-appropriate questions and activities
    - Include different types of questions (MCQ, fill-in-the-blanks, short answers)
    - Add practical exercises or word problems
    - Format it as a proper worksheet with spaces for answers
    - Include student name and date fields
    - Make it suitable for Indian curriculum
    - Length: 10-15 questions/activities
    
    Format the output as a ready-to-print worksheet.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating worksheet:", error)
    throw new Error("Failed to generate worksheet. Please check your API key and try again.")
  }
}

export async function generateVisualAid(topic: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Create a detailed description for a visual aid/diagram about: ${topic}
    
    Requirements:
    - Describe the visual elements in detail
    - Include labels and annotations
    - Make it educational and clear
    - Suitable for classroom use
    - Include step-by-step visual flow if applicable
    
    Topic: ${topic}
    
    Provide a detailed textual description that can be used to create the visual aid.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating visual aid:", error)
    throw new Error("Failed to generate visual aid. Please check your API key and try again.")
  }
}

export async function generateImagePrompt(topic: string): Promise<string> {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Create a detailed image generation prompt for an educational diagram about: ${topic}

    Requirements:
    - Create a clear, detailed prompt for AI image generation
    - Focus on educational visual elements
    - Include specific visual details, colors, layout
    - Make it suitable for classroom use
    - Specify diagram style (flowchart, illustration, infographic, etc.)
    - Include labels and text elements needed
    - Make it child-friendly and engaging
    
    Topic: ${topic}
    
    Return only the image generation prompt, no additional text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error("Error generating image prompt:", error)
    throw new Error("Failed to generate image prompt. Please check your API key and try again.")
  }
}

export async function generateGeneralResponse(prompt: string, context?: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const enhancedPrompt = `You are SAHAYAK, an AI Teaching Companion designed to help Indian educators. 
    
    Context: You are helping teachers create educational content, answer questions, and provide teaching assistance.
    
    User Query: ${prompt}
    
    ${context ? `Additional Context: ${context}` : ""}
    
    Instructions:
    - Provide helpful, educational responses
    - Make content relevant to Indian education system
    - Be supportive and encouraging
    - Include practical suggestions when applicable
    - Use simple, clear language
    - If asked about lesson plans, worksheets, or educational content, provide detailed responses
    - If asked general questions, provide informative answers with educational context
    
    Please provide a comprehensive response:`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating general response:", error)
    throw new Error("Failed to generate response. Please check your API key and try again.")
  }
}

export async function analyzeReading(transcript: string, language = "hindi") {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Analyze the following reading transcript and provide detailed assessment:

    Transcript: ${transcript}
    Language: ${language}
    
    Please provide analysis in the following JSON format:
    {
      "overallScore": number (0-100),
      "fluency": number (0-100),
      "pronunciation": number (0-100),
      "pace": number (0-100),
      "accuracy": number (0-100),
      "wordsPerMinute": number,
      "feedback": ["feedback point 1", "feedback point 2", ...],
      "suggestions": ["suggestion 1", "suggestion 2", ...]
    }
    
    Analyze for:
    - Reading fluency and rhythm
    - Pronunciation accuracy
    - Reading pace appropriateness
    - Overall reading skills
    - Provide constructive feedback
    - Give specific improvement suggestions`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return safeJSONParse(response.text())
  } catch (error) {
    console.error("Error analyzing reading:", error)
    throw new Error("Failed to analyze reading. Please check your API key and try again.")
  }
}

export async function analyzeReadingWithLanguage(transcript: string, language: string, originalText: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const languageNames = {
      hindi: "हिंदी (Hindi)",
      marathi: "मराठी (Marathi)",
      tamil: "தமிழ் (Tamil)",
      telugu: "తెలుగు (Telugu)",
      gujarati: "ગુજરાતી (Gujarati)",
      bengali: "বাংলা (Bengali)",
      kannada: "ಕನ್ನಡ (Kannada)",
      malayalam: "മലയാളം (Malayalam)",
      english: "English",
    }

    const prompt = `Analyze the following reading performance in ${languageNames[language as keyof typeof languageNames]} language:

    Original Text: ${originalText}
    Student's Reading Transcript: ${transcript}
    Language: ${languageNames[language as keyof typeof languageNames]}
    
    Please provide detailed analysis in the following JSON format:
    {
      "overallScore": number (0-100),
      "fluency": number (0-100),
      "pronunciation": number (0-100),
      "pace": number (0-100),
      "accuracy": number (0-100),
      "wordsPerMinute": number,
      "languageSpecificFeedback": ["feedback specific to ${languageNames[language as keyof typeof languageNames]} pronunciation", "grammar feedback", ...],
      "generalFeedback": ["general reading feedback", "fluency feedback", ...],
      "suggestions": ["improvement suggestion 1", "suggestion 2", ...],
      "strengths": ["strength 1", "strength 2", ...],
      "areasForImprovement": ["area 1", "area 2", ...]
    }
    
    Consider language-specific aspects:
    - Pronunciation of language-specific sounds and letters
    - Proper intonation and rhythm for the language
    - Correct stress patterns
    - Language-specific reading challenges
    - Cultural context and expression
    
    Provide constructive, encouraging feedback suitable for students.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return safeJSONParse(response.text())
  } catch (error) {
    console.error("Error analyzing reading:", error)
    throw new Error("Failed to analyze reading. Please check your API key and try again.")
  }
}

export async function generateLessonPlan(topic: string, grade: string, subject: string, duration: string) {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Create a comprehensive lesson plan for Indian school curriculum:

    Topic: ${topic}
    Grade: ${grade}
    Subject: ${subject}
    Duration: ${duration}
    
    Please provide a detailed lesson plan in the following JSON format:
    {
      "title": "Lesson Title",
      "grade": "${grade}",
      "subject": "${subject}",
      "duration": "${duration}",
      "learningObjectives": [
        "Objective 1",
        "Objective 2",
        "Objective 3"
      ],
      "prerequisites": [
        "What students should know before this lesson"
      ],
      "materials": [
        "Required materials and resources"
      ],
      "lessonStructure": [
        {
          "day": 1,
          "title": "Day 1 Title",
          "duration": "45 minutes",
          "activities": [
            {
              "type": "Introduction/Activity/Assessment",
              "description": "Detailed description of the activity",
              "time": "10 minutes",
              "materials": ["materials needed"],
              "instructions": "Step-by-step instructions"
            }
          ],
          "learningOutcomes": ["What students will learn today"]
        }
      ],
      "assessment": {
        "formative": [
          "Formative assessment methods"
        ],
        "summative": [
          "Summative assessment methods"
        ],
        "rubrics": [
          "Assessment criteria"
        ]
      },
      "differentiation": {
        "forStrugglingStudents": [
          "Support strategies for struggling students"
        ],
        "forAdvancedStudents": [
          "Extension activities for advanced students"
        ]
      },
      "homework": [
        "Homework assignments"
      ],
      "resources": [
        "Additional resources and references"
      ],
      "notes": [
        "Important notes for teachers"
      ]
    }
    
    Requirements:
    - Make it suitable for Indian education system
    - Include hands-on activities and practical examples
    - Consider the grade level appropriateness
    - Include assessment strategies
    - Provide differentiation strategies
    - Make it engaging and interactive
    - Include real-world connections
    - Consider cultural context
    - Provide clear learning objectives
    - Include time management for each activity`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return safeJSONParse(response.text())
  } catch (error) {
    console.error("Error generating lesson plan:", error)
    throw new Error("Failed to generate lesson plan. Please check your API key and try again.")
  }
}
