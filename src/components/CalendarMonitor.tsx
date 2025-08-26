import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  Avatar,
  Divider,
  Badge
} from '@mui/material';
import {
  Event as EventIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Videocam as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { CalendarService, CalendarEvent } from '../services/calendarService';

const CalendarMonitor: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [importantEvents, setImportantEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const calendarService = CalendarService.getInstance();

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const [upcomingResponse, todaysResponse, importantResponse] = await Promise.all([
        calendarService.getUpcomingEvents(7),
        calendarService.getTodaysEvents(),
        calendarService.getImportantEvents()
      ]);

      if (upcomingResponse.success && upcomingResponse.data) {
        setUpcomingEvents(upcomingResponse.data);
      }

      if (todaysResponse.success && todaysResponse.data) {
        setTodaysEvents(todaysResponse.data);
      }

      if (importantResponse.success && importantResponse.data) {
        setImportantEvents(importantResponse.data);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [calendarService]);

  useEffect(() => {
    loadCalendarData();
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadCalendarData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadCalendarData]);

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.startTime;
    const end = event.endTime;
    const isToday = start.toDateString() === new Date().toDateString();
    
    if (isToday) {
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <BusinessIcon />;
      case 'deadline':
        return <PriorityIcon />;
      case 'writing':
        return <EditIcon />;
      case 'promotion':
        return <EventIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return '#1976d2';
      case 'deadline':
        return '#d32f2f';
      case 'writing':
        return '#388e3c';
      case 'promotion':
        return '#f57c00';
      default:
        return '#6a1b9a';
    }
  };

  const isEventSoon = (event: CalendarEvent) => {
    const now = new Date();
    const eventTime = event.startTime;
    const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilEvent <= 2 && hoursUntilEvent > 0;
  };

  const getLocationIcon = (location?: string) => {
    if (!location) return null;
    
    const loc = location.toLowerCase();
    if (loc.includes('zoom') || loc.includes('meet') || loc.includes('remote')) {
      return <VideoIcon fontSize="small" />;
    } else if (loc.includes('phone') || loc.includes('call')) {
      return <PhoneIcon fontSize="small" />;
    } else {
      return <LocationIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {/* Header */}
      <Box sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Calendar Monitor for Kathleen
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCalendarData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Monitoring Kathleen's calendar for upcoming meetings, deadlines, and important events. 
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Alert>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            icon={<TodayIcon />}
            label={`${todaysEvents.length} Today`}
            color={todaysEvents.length > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<PriorityIcon />}
            label={`${importantEvents.length} Important`}
            color={importantEvents.length > 0 ? 'error' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<ScheduleIcon />}
            label={`${upcomingEvents.length} This Week`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Today's Events */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TodayIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Today's Events</Typography>
              {todaysEvents.some(event => isEventSoon(event)) && (
                <Badge badgeContent="!" color="error" sx={{ ml: 2 }} />
              )}
            </Box>
            
            <List dense>
              {todaysEvents.map((event) => (
                <ListItem 
                  key={event.id} 
                  divider
                  sx={{ 
                    bgcolor: isEventSoon(event) ? 'warning.light' : 'transparent',
                    borderLeft: `4px solid ${getEventTypeColor(event.type)}`,
                    mb: 1,
                    borderRadius: 1,
                    opacity: isEventSoon(event) ? 1 : 0.8
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: getEventTypeColor(event.type), width: 32, height: 32 }}>
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>
                          {event.title}
                        </Typography>
                        {event.isImportant && (
                          <PriorityIcon fontSize="small" color="error" />
                        )}
                        {isEventSoon(event) && (
                          <Chip label="Soon" size="small" color="warning" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatEventTime(event)}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {event.description}
                          </Typography>
                        )}
                        {event.location && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            {getLocationIcon(event.location)}
                            <Typography variant="caption" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            With: {event.attendees.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {todaysEvents.length === 0 && (
              <Alert severity="success">
                No events scheduled for today. Perfect time for focused writing!
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Important Upcoming Events */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PriorityIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">Important Upcoming Events</Typography>
            </Box>
            
            <List dense>
              {importantEvents.slice(0, 6).map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem 
                    sx={{ 
                      borderLeft: `3px solid ${getEventTypeColor(event.type)}`,
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getEventTypeColor(event.type), width: 28, height: 28 }}>
                        {getEventTypeIcon(event.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {event.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatEventTime(event)}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            <Chip 
                              label={event.type} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontSize: '10px', 
                                height: 20,
                                borderColor: getEventTypeColor(event.type),
                                color: getEventTypeColor(event.type)
                              }}
                            />
                            {event.recurringType && event.recurringType !== 'none' && (
                              <Chip 
                                label={event.recurringType} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '10px', height: 20 }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < importantEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {importantEvents.length === 0 && (
              <Alert severity="info">
                No important events coming up in the next two weeks.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Week Overview */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              This Week's Schedule
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Meetings: {upcomingEvents.filter(e => e.type === 'meeting').length}
              </Typography>
              <Box sx={{ bgcolor: '#1976d2', height: 4, width: `${(upcomingEvents.filter(e => e.type === 'meeting').length / Math.max(upcomingEvents.length, 1)) * 100}%`, borderRadius: 1, mt: 0.5 }} />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Deadlines: {upcomingEvents.filter(e => e.type === 'deadline').length}
              </Typography>
              <Box sx={{ bgcolor: '#d32f2f', height: 4, width: `${(upcomingEvents.filter(e => e.type === 'deadline').length / Math.max(upcomingEvents.length, 1)) * 100}%`, borderRadius: 1, mt: 0.5 }} />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Writing Sessions: {upcomingEvents.filter(e => e.type === 'writing').length}
              </Typography>
              <Box sx={{ bgcolor: '#388e3c', height: 4, width: `${(upcomingEvents.filter(e => e.type === 'writing').length / Math.max(upcomingEvents.length, 1)) * 100}%`, borderRadius: 1, mt: 0.5 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CalendarMonitor;