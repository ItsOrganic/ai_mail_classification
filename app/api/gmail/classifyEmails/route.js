import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function classifyEmail(subject, body) {
  const prompt = `Please classify this email based on its content::\n\n${subject}\n\n${body}\n\nChoose one from the following categories:
    "important": Emails that are personal or work-related and require immediate attention.
        "promotion": Emails related to sales, discounts, and marketing campaigns.
        "social": Emails from social networks, friends, and family.
        "marketing": Emails related to marketing, newsletters, and notifications.
        "spam": Unwanted or unsolicited emails.
        "general": If none of the above are matched, use General.
        Just give one word from the classification provided which is (important, promotion, social, marketing, spam, or general) no * or anything`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const decision = response.text().trim();
    console.log('Gemini Classification:', decision);

    return decision;
  } catch (error) {
    console.error('Error in Gemini API call:', error.message);
    return 'Unclassified';
  }
}

export async function POST(request) {
  try {
    const { emails } = await request.json();
    console.log('Received emails for classification:', emails);

    const classifiedEmails = await Promise.all(emails.map(async (email) => {
      const classification = await classifyEmail(email.subject, email.body);
      console.log('Email Classification:', { id: email.id, classification });
      return {
        ...email,
        classification,
      };
    }));

    return NextResponse.json({ classifiedEmails }, { status: 200 });
  } catch (error) {
    console.error('Error classifying emails:', error.message);
    return NextResponse.json({ message: 'Error classifying emails' }, { status: 500 });
  }
}

