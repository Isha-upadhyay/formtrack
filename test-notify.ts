import { sendLeadNotification, sendAutoReply } from './src/lib/notify';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing Lead Notification Email...');
  try {
    await sendLeadNotification({
      toEmail: 'ishaupadhyay3542870@gmail.com', // Correct Admin Email
      formName: 'Live Test Form',
      leadData: {
        'Full Name': 'John Doe (Test)',
        'Email Address': 'john.doe@example.com',
        'Message': 'This is a live test of the FormTrack notification system.'
      },
      sourceSummary: 'Direct visit — This is a test lead.'
    });
    console.log('✅ Admin Notification Sent Successfully!');
  } catch (e) {
    console.error('❌ Failed to send Admin Notification:', e);
  }

  console.log('\nTesting Auto-Reply Email...');
  try {
    await sendAutoReply({
      toEmail: 'ishaupadhyay3542870@gmail.com', // Correct test email
      subject: 'Thanks for reaching out! (Test)',
      message: 'Hi John,\n\nWe received your message and will get back to you soon. This is a test of the auto-reply feature.\n\nBest,\nFormTrack Team',
      formName: 'Live Test Form'
    });
    console.log('✅ Auto-Reply Sent Successfully!');
  } catch (e) {
    console.error('❌ Failed to send Auto-Reply:', e);
  }
}

testEmail();
