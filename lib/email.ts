import { resend } from '@/lib/resend';

type ConfirmationEmailArgs = {
  to: string;
  clientName: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
  amountPaid: number;
};

type AdminNotificationArgs = {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
  amountPaid: number;
};

export async function sendClientConfirmationEmail({
  to,
  clientName,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
  amountPaid,
}: ConfirmationEmailArgs) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your booking is confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Your booking is confirmed</h1>
        <p>Hi ${clientName || 'there'},</p>
        <p>Your deposit has been received and your appointment is now confirmed.</p>

        <h3>Appointment Details</h3>
        <ul>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Deposit Paid:</strong> $${amountPaid.toFixed(2)}</li>
        </ul>

        <p>Please keep an eye on your dashboard for updates and arrive on time for your appointment.</p>
      </div>
    `,
  });
}

export async function sendAdminBookingNotification({
  bookingId,
  clientName,
  clientEmail,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
  amountPaid,
}: AdminNotificationArgs) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!to) return;

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `New confirmed booking: ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>New confirmed booking</h1>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Client:</strong> ${clientName}</li>
          <li><strong>Email:</strong> ${clientEmail}</li>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Deposit Paid:</strong> $${amountPaid.toFixed(2)}</li>
        </ul>
      </div>
    `,
  });
}
