export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer:
        'Choose your service, variation, provider, date, and available time slot, then complete your deposit payment at checkout.',
    },
    {
      question: 'Do I need to pay a deposit?',
      answer:
        'Yes. Deposits are required to secure an appointment and are collected during checkout.',
    },
    {
      question: 'Can I reschedule my appointment?',
      answer:
        'Yes, clients can reschedule based on provider availability from the client dashboard.',
    },
    {
      question: 'Are cancellations refundable?',
      answer:
        'Refund eligibility depends on how far in advance the appointment is cancelled and your booking policy.',
    },
    {
      question: 'Can I upload inspiration photos?',
      answer:
        'Yes. You can upload inspiration photos during booking and also review them later in your client dashboard.',
    },
    {
      question: 'Will I receive confirmation emails?',
      answer:
        'Yes. Confirmation, refund, and booking update emails are sent automatically when those actions occur.',
    },
  ];

  return (
    <main className="section shell">
      <p className="eyebrow">FAQ</p>
      <h1>Frequently Asked Questions</h1>
      <p className="muted max-2xl">
        Find answers to common questions about booking, payments, cancellations, and appointment management.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {faqs.map((faq) => (
          <div key={faq.question} className="card card-body">
            <h2>{faq.question}</h2>
            <p className="muted">{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
