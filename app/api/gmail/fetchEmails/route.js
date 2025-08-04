// pages/api/gmail/fetchEmails.js

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

async function getEmailBody(message) {
  try {
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
  } catch (error) {
    console.error('Error parsing email body:', error);
    return 'Unable to parse email content';
  }
}

export async function GET(request) {
  try {
    // Get session using getServerSession
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('No session found');
      return NextResponse.json({ message: 'Unauthorized - No session' }, { status: 401 });
    }

    if (!session.accessToken) {
      console.error('No access token in session');
      return NextResponse.json({ message: 'Unauthorized - No access token' }, { status: 401 });
    }

    console.log('Session user:', session.user?.email);
    console.log('Access token exists:', !!session.accessToken);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth });
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit'), 10) || 15;

    console.log('Fetching emails with limit:', limit);

    // Test the Gmail API connection first
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail profile:', profile.data.emailAddress);
    } catch (profileError) {
      console.error('Error getting Gmail profile:', profileError);
      return NextResponse.json({
        message: 'Gmail API access failed - please check permissions',
        error: profileError.message
      }, { status: 403 });
    }

    const results = await gmail.users.messages.list({
      userId: 'me',
      maxResults: limit,
    });

    const messages = results.data.messages || [];
    console.log('Found messages:', messages.length);

    if (messages.length === 0) {
      return NextResponse.json({ emails: [] }, { status: 200 });
    }

    const emailPromises = messages.map(async (message) => {
      try {
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
          classification: 'general', // Default classification
        };
      } catch (error) {
        console.error('Error processing message:', message.id, error);
        return {
          id: message.id,
          subject: 'Error loading email',
          sender: 'Unknown',
          body: 'Unable to load email content',
          classification: 'general',
        };
      }
    });

    const emails = await Promise.all(emailPromises);
    console.log('Successfully processed emails:', emails.length);

    return NextResponse.json({ emails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching emails:', error);

    // More specific error messages
    if (error.code === 401) {
      return NextResponse.json({ message: 'Authentication failed - please sign in again' }, { status: 401 });
    } else if (error.code === 403) {
      return NextResponse.json({ message: 'Gmail access not granted - please check permissions' }, { status: 403 });
    } else if (error.code === 429) {
      return NextResponse.json({ message: 'Rate limit exceeded - please try again later' }, { status: 429 });
    }

    return NextResponse.json({
      message: 'Error fetching emails',
      error: error.message
    }, { status: 500 });
  }
}
