// app/api/review/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface CodeReviewRequest {
  code: string;
  language: string;
}

interface CodeReviewResponse {
  score: number;
  suggestions: string[];
  security: string[];
  bestPractices: string;
  complexity: {
    score: number;
    details: string;
  };
  performance: {
    score: number;
    suggestions: string[];
  };
}

export async function POST(req: Request) {
  try {
    const { code, language }: CodeReviewRequest = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code or language not provided' },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert code reviewer and senior software developer. Analyze the following ${language} code and provide a detailed review in the following JSON format:
      {
        "score": number (1-10),
        "suggestions": string[] (list of specific improvement suggestions),
        "security": string[] (list of security concerns or vulnerabilities),
        "bestPractices": string (detailed best practices recommendations),
        "complexity": {
          "score": number (1-10),
          "details": string (explanation of complexity analysis)
        },
        "performance": {
          "score": number (1-10),
          "suggestions": string[] (list of performance improvement suggestions)
        }
      }

      Focus on:
      1. Code quality and readability
      2. Security vulnerabilities
      3. Performance optimizations
      4. Adherence to ${language} best practices
      5. Code complexity and maintainability
      6. Potential bugs or edge cases

      Here's the code to analyze:
      ${code}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 2048,
    });

    const completionResponse = completion.choices[0]?.message?.content || '';

    // Enhanced JSON extraction
    const jsonMatch = completionResponse.match(/{[\s\S]*}/);

    if (jsonMatch && jsonMatch[0]) {
      const jsonResponse = jsonMatch[0].trim();
      

     // Validate the JSON before parsing
     if (isValidJSON(jsonResponse)) {
      try {
        const response: CodeReviewResponse = JSON.parse(jsonResponse);
        return NextResponse.json(response);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonResponse, jsonError);
        return NextResponse.json(
          { error: 'Invalid JSON response from Groq API. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      console.error('Extracted JSON is invalid:', jsonResponse);
      return NextResponse.json(
        { error: 'Extracted JSON is invalid. Please check the response.' },
        { status: 500 }
      );
    }
  } else {
    console.error('No valid JSON block found in response:', completionResponse);
    return NextResponse.json(
      { error: 'No valid JSON found in the Groq API response.' },
      { status: 500 }
    );
  }
} catch (error) {
  console.error('Error processing code review:', error);
  return NextResponse.json(
    { error: 'Failed to process code review.' },
    { status: 500 }
  );
}
}

// Function to validate JSON
function isValidJSON(jsonString : any) {
try {
  JSON.parse(jsonString);
  return true; // If parsing succeeds, the JSON is valid
} catch (e) {
  return false; // If parsing fails, the JSON is invalid
}
}
