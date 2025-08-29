export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  type: 'meeting' | 'deadline' | 'promotion' | 'writing' | 'personal';
  isImportant: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface CalendarServiceResponse {
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}

export class CalendarService {
  private static instance: CalendarService;
  
  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarServiceResponse> {
    try {
      // Check if Google Calendar API is configured
      const calendarApiKey = process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY;
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      if (!calendarApiKey || !clientId) {
        return this.getMockEvents();
      }

      // Note: In production, you would use Google Calendar API with proper OAuth2
      // For now, return mock data to prevent API errors
      return this.getMockEvents();
      
    } catch (error) {
      console.error('Calendar Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calendar fetch failed',
      };
    }
  }

  async getTodaysEvents(): Promise<CalendarServiceResponse> {
    try {
      const response = await this.getUpcomingEvents(1);
      if (response.success && response.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysEvents = response.data.filter(event => 
          event.startTime >= today && event.startTime < tomorrow
        );
        
        return { success: true, data: todaysEvents };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch today\'s events',
      };
    }
  }

  async getImportantEvents(): Promise<CalendarServiceResponse> {
    try {
      const response = await this.getUpcomingEvents(14); // Next 2 weeks
      if (response.success && response.data) {
        const importantEvents = response.data.filter(event => 
          event.isImportant || 
          this.isBusinessEvent(event) ||
          this.isDeadline(event)
        );
        return { success: true, data: importantEvents };
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch important events',
      };
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      // In production, this would call the Google Calendar API
      const eventId = Date.now().toString();
      console.log(`Creating calendar event: ${event.title}`);
      return { success: true, eventId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event',
      };
    }
  }

  private isBusinessEvent(event: CalendarEvent): boolean {
    const businessKeywords = [
      'interview', 'meeting', 'call', 'publisher', 'agent', 'marketing',
      'book', 'signing', 'event', 'promotion', 'deadline', 'launch'
    ];
    
    const searchText = `${event.title} ${event.description}`.toLowerCase();
    return businessKeywords.some(keyword => searchText.includes(keyword));
  }

  private isDeadline(event: CalendarEvent): boolean {
    return event.type === 'deadline' || 
           event.title.toLowerCase().includes('deadline') ||
           event.title.toLowerCase().includes('due');
  }

  private getMockEvents(): CalendarServiceResponse {
    const now = new Date();
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Horror Magazine Interview',
        description: 'Phone interview about The Dark Road with Horror Digest Magazine',
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
        type: 'meeting',
        isImportant: true,
        attendees: ['editor@horrordigest.com']
      },
      {
        id: '2',
        title: 'BookBub Promo Deadline',
        description: 'Submit promotional materials for upcoming BookBub featured deal',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        type: 'deadline',
        isImportant: true
      },
      {
        id: '3',
        title: 'Writing Session - New Chapter',
        description: 'Focused writing time for next book project',
        startTime: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow afternoon
        endTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
        type: 'writing',
        isImportant: false,
        recurringType: 'daily'
      },
      {
        id: '4',
        title: 'Agent Call - Foreign Rights',
        description: 'Discussion about international publishing opportunities',
        startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(now.getTime() + 49 * 60 * 60 * 1000),
        type: 'meeting',
        isImportant: true,
        attendees: ['agent@literaryagency.com']
      },
      {
        id: '5',
        title: 'Horror Talks Podcast Recording',
        description: 'Podcast interview about writing process and The Dark Road',
        startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days from now
        endTime: new Date(now.getTime() + 74 * 60 * 60 * 1000),
        location: 'Remote (Zoom)',
        type: 'meeting',
        isImportant: true
      },
      {
        id: '6',
        title: 'Social Media Content Planning',
        description: 'Plan and schedule posts for the upcoming week',
        startTime: new Date(now.getTime() + 96 * 60 * 60 * 1000), // 4 days from now
        endTime: new Date(now.getTime() + 98 * 60 * 60 * 1000),
        type: 'promotion',
        isImportant: false,
        recurringType: 'weekly'
      },
      {
        id: '7',
        title: 'Book Launch Event Planning',
        description: 'Meeting with event coordinator for next book release',
        startTime: new Date(now.getTime() + 120 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(now.getTime() + 122 * 60 * 60 * 1000),
        type: 'meeting',
        isImportant: true,
        attendees: ['events@bookstore.com']
      }
    ];

    return { success: true, data: mockEvents };
  }
}