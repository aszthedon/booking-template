import { resend } from '@/lib/resend';

function emailShell(title: string, content: string) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f8f7f4; padding: 32px;">
      <div style="max-width: 620px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #eee;">
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #7b4b33;">
            Crown Studio
          </p>
          <h1 style="margin: 8px 0 0; font-size: 28px; color: #1f1a17;">${title}</h1>
        </div>

        <div style="color: #333; line-height: 1.65; font-size: 15px;">
          ${content}
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #777; margin: 0;">
          This message was sent by Crown Studio booking system.
        </p>
      </div>
    </div>
  `;
}

export async function sendClientConfirmationEmail({
  to,
  clientName,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
  amountPaid,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
  amountPaid: number;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your booking is confirmed',
    html: emailShell(
      'Your booking is confirmed',
      `
        <p>Hi ${clientName || 'there'},</p>
        <p>Your deposit has been received and your appointment is now confirmed.</p>
        <ul>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Deposit Paid:</strong> $${amountPaid.toFixed(2)}</li>
        </ul>
      `
    ),
  });
}

export async function sendClientCancelledEmail({
  to,
  clientName,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your booking was cancelled',
    html: emailShell(
      'Your booking was cancelled',
      `
        <p>Hi ${clientName || 'there'},</p>
        <p>Your appointment has been cancelled.</p>
        <ul>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
        </ul>
      `
    ),
  });
}

export async function sendClientRescheduledEmail({
  to,
  clientName,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your booking was rescheduled',
    html: emailShell(
      'Your booking was rescheduled',
      `
        <p>Hi ${clientName || 'there'},</p>
        <p>Your appointment has been updated.</p>
        <ul>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>New Date:</strong> ${appointmentDate}</li>
          <li><strong>New Time:</strong> ${appointmentTime}</li>
        </ul>
      `
    ),
  });
}

export async function sendClientRefundEmail({
  to,
  clientName,
  refundedAmount,
}: {
  to: string;
  clientName: string;
  refundedAmount: number;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your refund has been processed',
    html: emailShell(
      'Your refund has been processed',
      `
        <p>Hi ${clientName || 'there'},</p>
        <p>Your refund has been issued successfully.</p>
        <ul>
          <li><strong>Refund Amount:</strong> $${refundedAmount.toFixed(2)}</li>
        </ul>
        <p>Please allow your payment method some time to reflect the refund.</p>
      `
    ),
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
}: {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
  amountPaid: number;
}) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `New confirmed booking: ${clientName}`,
    html: emailShell(
      'New confirmed booking',
      `
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
      `
    ),
  });
}

export async function sendStaffBookingNotification({
  to,
  providerName,
  clientName,
  serviceName,
  variationName,
  appointmentDate,
  appointmentTime,
}: {
  to: string;
  providerName: string;
  clientName: string;
  serviceName: string;
  variationName: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'New appointment assigned to you',
    html: emailShell(
      'New appointment assigned',
      `
        <p>Hi ${providerName || 'there'},</p>
        <p>A new appointment has been assigned to your schedule.</p>
        <ul>
          <li><strong>Client:</strong> ${clientName}</li>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Variation:</strong> ${variationName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
        </ul>
      `
    ),
  });
}
