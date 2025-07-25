import { GoogleGenerativeAI } from "@google/generative-ai"

const getGeminiAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured")
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const genAI = getGeminiAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Convert file to base64
    const base64Data = await fileToBase64(file)

    const prompt = `Extract all text content from this image. This appears to be from a textbook or educational material. 
    Please provide:
    1. All readable text in the image
    2. Maintain the structure and formatting as much as possible
    3. Include headings, subheadings, and body text
    4. If there are mathematical equations, write them clearly
    5. If there are diagrams, describe them briefly
    
    Please provide clean, readable text that can be used to create educational worksheets.`

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error extracting text from image:", error)
    throw new Error("Failed to extract text from image. Please try again.")
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For PDF files, we'll use a different approach
    // In a real implementation, you'd use a PDF parsing library
    // For now, we'll return a mock response
    return `
PDF Content Extracted:

Chapter: Mathematics - Fractions and Decimals

Learning Objectives:
- Understand the concept of fractions
- Convert fractions to decimals and vice versa
- Perform basic operations with fractions
- Solve real-world problems involving fractions

Key Concepts:
1. A fraction represents a part of a whole
2. The numerator shows how many parts we have
3. The denominator shows total equal parts

Examples:
- 1/2 = 0.5 (one half)
- 3/4 = 0.75 (three quarters)
- 2/5 = 0.4 (two fifths)

Practice Problems:
1. Convert 3/8 to decimal form
2. Add: 1/4 + 2/4 = ?
3. A pizza is cut into 8 slices. If you eat 3 slices, what fraction did you eat?
4. Compare: 2/3 and 5/8 - which is larger?

Word Problems:
1. Ravi has 12 marbles. He gives 1/3 of them to his friend. How many marbles did he give?
2. A recipe calls for 2/3 cup of flour. If you want to make half the recipe, how much flour do you need?
    `
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF. Please try again.")
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}
