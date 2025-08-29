// import { API_CONFIG } from './config'; // Will be used when Google API integration is implemented

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: Date;
  isRead: boolean;
  isImportant: boolean;
  labels: string[];
}

export interface EmailServiceResponse {
  success: boolean;
  data?: EmailMessage[];
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async getRecentEmails(maxResults: number = 10): Promise<EmailServiceResponse> {
    try {
      // Check if Google API credentials are configured
      const googleApiKey = process.env.REACT_APP_GMAIL_API_KEY;
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      if (!googleApiKey || !clientId) {
        return this.getMockEmails();
      }

      // Note: In production, you would use Google's Gmail API with proper OAuth2
      // For now, return mock data to prevent API errors
      return this.getMockEmails();
      
    } catch (error) {
      console.error('Email Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email fetch failed',
      };
    }
  }

  async markAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would call the Gmail API
      console.log(`Marking email ${messageId} as read`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      };
    }
  }

  async getImportantEmails(): Promise<EmailServiceResponse> {
    try {
      const response = await this.getRecentEmails();
      if (response.success && response.data) {
        const importantEmails = response.data.filter(email => 
          email.isImportant || 
          this.isBusinessRelated(email) ||
          this.isFromPublisher(email)
        );
        return { success: true, data: importantEmails };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch important emails',
      };
    }
  }

  private isBusinessRelated(email: EmailMessage): boolean {
    const businessKeywords = [
      'book', 'publisher', 'agent', 'contract', 'royalty', 'marketing',
      'interview', 'review', 'promotion', 'amazon', 'bookbub', 'goodreads'
    ];
    
    const searchText = `${email.subject} ${email.from} ${email.snippet}`.toLowerCase();
    return businessKeywords.some(keyword => searchText.includes(keyword));
  }

  private isFromPublisher(email: EmailMessage): boolean {
    const publisherDomains = [
      'penguin', 'harpercollins', 'macmillan', 'simonandschuster',
      'amazon', 'bookbub', 'goodreads', 'kirkusreviews'
    ];
    
    const fromDomain = email.from.toLowerCase();
    return publisherDomains.some(domain => fromDomain.includes(domain));
  }

  private getMockEmails(): EmailServiceResponse {
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        from: 'editor@horrormagazine.com',
        subject: 'Re: The Dark Road - Feature Interview Request',
        snippet: 'We would love to feature you in our upcoming horror authors spotlight...',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        isImportant: true,
        labels: ['Business', 'Interview']
      },
      {
        id: '2', 
        from: 'marketing@bookbub.com',
        subject: 'Your BookBub Featured Deal Performance',
        snippet: 'Great news! Your featured deal for The Dark Road exceeded expectations...',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isRead: false,
        isImportant: true,
        labels: ['Marketing', 'Sales']
      },
      {
        id: '3',
        from: 'reviews@goodreads.com',
        subject: 'New 5-star review for The Dark Road',
        snippet: 'A reader just left a glowing review: "Absolutely spine-chilling! Couldn\'t put it down..."',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        isRead: true,
        isImportant: false,
        labels: ['Reviews']
      },
      {
        id: '4',
        from: 'agent@literaryagency.com',
        subject: 'Foreign Rights Interest - The Dark Road',
        snippet: 'I have some exciting news about international publishing interest...',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        isRead: false,
        isImportant: true,
        labels: ['Agent', 'Rights']
      },
      {
        id: '5',
        from: 'podcast@horrortalks.com',
        subject: 'Podcast Interview Invitation',
        snippet: 'We would love to have you as a guest on Horror Talks podcast...',
        date: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        isRead: true,
        isImportant: false,
        labels: ['Media', 'Podcast']
      }
    ];

    return { success: true, data: mockEmails };
  }
}