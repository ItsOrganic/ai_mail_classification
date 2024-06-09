// pages/api/gmail/fetchEmails.js

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function getEmailBody(message) {
  const parts = message.data.payload.parts;
  let body = '';

  if (parts) {
    parts.forEach(part => {
      if (part.mimeType === 'text/plain') {
        body += part.body.data ? Buffer.from(part.body.data, 'base64').toString('utf8') : '';
      }
    });
  } else {
    body = message.data.payload.body.data ? Buffer.from(message.data.payload.body.data, 'base64').toString('utf8') : '';
  }

  return body;
}

export async function GET(request) {
  try {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = token.accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit'), 10) || 15;

    const results = await gmail.users.messages.list({
      userId: 'me',
      maxResults: limit,
    });

    const messages = results.data.messages || [];

    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const subjectHeader = msg.data.payload.headers.find(header => header.name === 'Subject');
      const senderHeader = msg.data.payload.headers.find(header => header.name === 'From');
      const subject = subjectHeader ? subjectHeader.value : 'No Subject';
      const sender = senderHeader ? senderHeader.value : 'No Sender';
      const body = await getEmailBody(msg);

      return {
        id: message.id,
        subject,
        sender,
        body,
        classification: ' ',
      };
    });

    const emails = await Promise.all(emailPromises);
    return NextResponse.json({ emails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching or classifying emails:', error);
    return NextResponse.json({ message: 'Error fetching or classifying emails' }, { status: 500 });
  }
}
