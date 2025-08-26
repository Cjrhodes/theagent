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
  IconButton,
  Chip,
  Button,
  Divider,
  Badge,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  MarkEmailRead as ReadIcon,
  PriorityHigh as PriorityIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { EmailService, EmailMessage } from '../services/emailService';

const EmailMonitor: React.FC = () => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [importantEmails, setImportantEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const emailService = EmailService.getInstance();

  const loadEmails = useCallback(async () => {
    setLoading(true);
    try {
      const [recentResponse, importantResponse] = await Promise.all([
        emailService.getRecentEmails(10),
        emailService.getImportantEmails()
      ]);

      if (recentResponse.success && recentResponse.data) {
        setEmails(recentResponse.data);
      }

      if (importantResponse.success && importantResponse.data) {
        setImportantEmails(importantResponse.data);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  }, [emailService]);

  useEffect(() => {
    loadEmails();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadEmails, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadEmails]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await emailService.markAsRead(messageId);
      setEmails(prev => prev.map(email => 
        email.id === messageId ? { ...email, isRead: true } : email
      ));
      setImportantEmails(prev => prev.map(email => 
        email.id === messageId ? { ...email, isRead: true } : email
      ));
    } catch (error) {
      console.error('Failed to mark email as read:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = emails.filter(email => !email.isRead).length;
  const importantUnreadCount = importantEmails.filter(email => !email.isRead).length;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {/* Header */}
      <Box sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Email Monitor for Kathleen
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadEmails}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Monitoring Kathleen's email for important business communications, reviews, 
            interview requests, and publishing opportunities. Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Alert>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            icon={<EmailIcon />}
            label={`${unreadCount} Unread`}
            color={unreadCount > 0 ? 'warning' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<PriorityIcon />}
            label={`${importantUnreadCount} Important`}
            color={importantUnreadCount > 0 ? 'error' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<BusinessIcon />}
            label={`${emails.length} Total`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Important Emails */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PriorityIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">Important Business Emails</Typography>
              {importantUnreadCount > 0 && (
                <Badge badgeContent={importantUnreadCount} color="error" sx={{ ml: 2 }} />
              )}
            </Box>
            
            <List dense>
              {importantEmails.slice(0, 5).map((email) => (
                <ListItem 
                  key={email.id} 
                  divider
                  sx={{ 
                    bgcolor: email.isRead ? 'transparent' : 'action.hover',
                    borderLeft: email.isImportant ? '4px solid #f44336' : 'none',
                    mb: 1,
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon>
                    <IconButton 
                      size="small" 
                      onClick={() => handleMarkAsRead(email.id)}
                      color={email.isRead ? 'default' : 'primary'}
                    >
                      <EmailIcon />
                    </IconButton>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: email.isRead ? 'normal' : 'bold',
                            flex: 1
                          }}
                        >
                          {email.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(email.date)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          From: {email.from}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {email.snippet}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {email.labels.map((label, index) => (
                            <Chip 
                              key={index} 
                              label={label} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '10px', height: 20 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  {!email.isRead && (
                    <IconButton 
                      size="small" 
                      onClick={() => handleMarkAsRead(email.id)}
                      color="primary"
                    >
                      <ReadIcon />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>

            {importantEmails.length === 0 && (
              <Alert severity="success">
                No urgent business emails at the moment.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* All Recent Emails */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Emails</Typography>
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="warning" sx={{ ml: 2 }} />
              )}
            </Box>
            
            <List dense>
              {emails.map((email, index) => (
                <React.Fragment key={email.id}>
                  <ListItem 
                    sx={{ 
                      bgcolor: email.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMarkAsRead(email.id)}
                        color={email.isRead ? 'default' : 'primary'}
                      >
                        <EmailIcon />
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: email.isRead ? 'normal' : 'bold',
                              flex: 1
                            }}
                          >
                            {email.subject}
                          </Typography>
                          {email.isImportant && (
                            <PriorityIcon fontSize="small" color="error" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(email.date)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {email.from}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {email.snippet.substring(0, 100)}...
                          </Typography>
                        </Box>
                      }
                    />
                    {!email.isRead && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleMarkAsRead(email.id)}
                        color="primary"
                      >
                        <ReadIcon />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < emails.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {emails.length === 0 && (
              <Alert severity="info">
                No recent emails found.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default EmailMonitor;