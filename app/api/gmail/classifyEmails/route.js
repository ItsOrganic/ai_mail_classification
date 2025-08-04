import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY environment variable is not set - will try to get from request');
}

let genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
let model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

function initializeGemini(apiKeyFromRequest) {
  if (apiKeyFromRequest && !genAI) {
    console.log('Initializing Gemini with API key from request');
    genAI = new GoogleGenerativeAI(apiKeyFromRequest);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return true;
  }
  return !!genAI;
}

async function classifyEmail(subject, body) {
  if (!model) {
    console.error('Gemini model not initialized - API key missing');
    return 'general';
  }

  const prompt = `Please classify this email based on its content:

Subject: ${subject}

Body: ${body.substring(0, 1000)}${body.length > 1000 ? '...' : ''}

Choose one from the following categories:
- "important": Emails that are personal or work-related and require immediate attention
- "promotion": Emails related to sales, discounts, and marketing campaigns
- "social": Emails from social networks, friends, and family
- "marketing": Emails related to marketing, newsletters, and notifications
- "spam": Unwanted or unsolicited emails
- "general": If none of the above are matched, use General

Just give one word from the classification provided which is (important, promotion, social, marketing, spam, or general) no * or anything`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const decision = response.text().trim().toLowerCase();
    console.log('Gemini Classification:', decision);

    // Validate the response
    const validClassifications = ['important', 'promotion', 'social', 'marketing', 'spam', 'general'];
    if (validClassifications.includes(decision)) {
      return decision;
    } else {
      console.warn('Invalid classification received:', decision, '- defaulting to general');
      return 'general';
    }
  } catch (error) {
    console.error('Error in Gemini API call:', error.message);
    return 'general';
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { emails, apiKey: apiKeyFromRequest } = body;

    // Try to initialize Gemini with API key from request if not already initialized
    if (!model && apiKeyFromRequest) {
      initializeGemini(apiKeyFromRequest);
    }

    if (!model) {
      return NextResponse.json({
        message: 'Gemini API key not configured',
        error: 'Please provide GEMINI_API_KEY environment variable or API key in request'
      }, { status: 500 });
    }

    console.log('Received emails for classification:', emails?.length || 0);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({
        message: 'No emails provided for classification',
        classifiedEmails: []
      }, { status: 400 });
    }

    const classifiedEmails = await Promise.all(emails.map(async (email, index) => {
      try {
        console.log(`Classifying email ${index + 1}/${emails.length}:`, email.subject);
        const classification = await classifyEmail(email.subject, email.body);
        console.log('Email Classification:', { id: email.id, subject: email.subject, classification });
        return {
          ...email,
          classification,
        };
      } catch (error) {
        console.error('Error classifying email:', email.id, error);
        return {
          ...email,
          classification: 'general',
        };
      }
    }));

    console.log('Successfully classified emails:', classifiedEmails.length);
    return NextResponse.json({ classifiedEmails }, { status: 200 });
  } catch (error) {
    console.error('Error classifying emails:', error.message);
    return NextResponse.json({
      message: 'Error classifying emails',
      error: error.message
    }, { status: 500 });
  }
}

