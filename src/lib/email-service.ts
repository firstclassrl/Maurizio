// Email service configuration for LexAgenda
// This file should be configured with your preferred email service

interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

interface TaskReminderData {
  userEmail: string
  taskPratica: string
  taskScadenza: string
  reminderType: 'day_before' | 'urgent'
}

// Email templates
export const emailTemplates = {
  dayBeforeReminder: (data: TaskReminderData) => ({
    subject: `🔔 Promemoria: Scadenza domani - ${data.taskPratica}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">LexAgenda</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema di gestione pratiche legali</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">🔔 Promemoria Scadenza</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Ti ricordiamo che la pratica <strong>"${data.taskPratica}"</strong> scade <strong>domani (${data.taskScadenza})</strong>.
          </p>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
          <p style="margin: 0; color: #1976d2; font-weight: 500;">
            💡 Consiglio: Completa questa attività oggi per evitare ritardi!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Creato da <strong>Abruzzo.AI</strong> - Copyright 2025
          </p>
        </div>
      </div>
    `,
    text: `Promemoria: La pratica "${data.taskPratica}" scade domani (${data.taskScadenza}). Completa questa attività oggi per evitare ritardi!`
  }),
  
  urgentReminder: (data: TaskReminderData) => ({
    subject: `🚨 URGENTE: Scadenza scaduta - ${data.taskPratica}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">LexAgenda</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema di gestione pratiche legali</p>
        </div>
        
        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #f44336;">
          <h2 style="color: #d32f2f; margin-top: 0;">🚨 SCADENZA URGENTE</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            La pratica <strong>"${data.taskPratica}"</strong> è <strong>SCADUTA</strong> il <strong>${data.taskScadenza}</strong>.
          </p>
        </div>
        
        <div style="background: #ffcdd2; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #d32f2f; font-weight: 500;">
            ⚠️ AZIONE IMMEDIATA RICHIESTA: Controlla immediatamente questa pratica!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Creato da <strong>Abruzzo.AI</strong> - Copyright 2025
          </p>
        </div>
      </div>
    `,
    text: `URGENTE: La pratica "${data.taskPratica}" è SCADUTA il ${data.taskScadenza}. Azione immediata richiesta!`
  })
}

// Email service functions (to be implemented with actual email service)
export const emailService = {
  // This function should be implemented with your email service provider
  // Examples: Resend, SendGrid, AWS SES, etc.
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // TODO: Implement actual email sending
      // Example with Resend:
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'LexAgenda <noreply@lexagenda.com>',
      //     to: [emailData.to],
      //     subject: emailData.subject,
      //     html: emailData.html,
      //     text: emailData.text,
      //   }),
      // })
      
      console.log('Email would be sent:', emailData)
      
      // For now, just log the email data
      // In production, replace this with actual email service
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  },
  
  async sendTaskReminder(reminderData: TaskReminderData): Promise<boolean> {
    const template = reminderData.reminderType === 'urgent' 
      ? emailTemplates.urgentReminder(reminderData)
      : emailTemplates.dayBeforeReminder(reminderData)
    
    const emailData: EmailData = {
      to: reminderData.userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    }
    
    return await this.sendEmail(emailData)
  }
}

// Function to process pending email reminders
export async function processEmailReminders() {
  try {
    // This would typically be called by a cron job or scheduled function
    // For now, it's a placeholder for the email processing logic
    
    console.log('Processing email reminders...')
    
    // TODO: Implement actual email reminder processing
    // 1. Query pending reminders from database
    // 2. Send emails using emailService.sendTaskReminder
    // 3. Update reminder status to 'sent' or 'failed'
    
    return true
  } catch (error) {
    console.error('Error processing email reminders:', error)
    return false
  }
}
