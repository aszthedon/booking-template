export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Jordan',
      text:
        'The booking process was smooth, the reminders were helpful, and everything felt very professional from start to finish.',
    },
    {
      name: 'Taylor',
      text:
        'I loved being able to upload inspiration photos and manage my appointment from the dashboard.',
    },
    {
      name: 'Morgan',
      text:
        'The system made it really easy to reschedule when I needed to, and the confirmation emails kept me updated.',
    },
  ];

  return (
    <main className="section shell">
      <p className="eyebrow">Testimonials</p>
      <h1>What Clients Are Saying</h1>
      <p className="muted max-2xl">
        Feedback from clients who have used the booking platform and appointment experience.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="card card-body">
            <h2>{testimonial.name}</h2>
            <p className="muted">“{testimonial.text}”</p>
          </div>
        ))}
      </div>
    </main>
  );
}
