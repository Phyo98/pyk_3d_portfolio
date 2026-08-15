import { Mail, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

const contactHighlights = [
  { label: 'Email', value: 'info@libertyglobaleducation.com', icon: Mail },
  {
    label: 'Focus',
    value: 'Full stack web apps, REST APIs, creative frontends, and mobile with Flutter',
    icon: Sparkles,
  },
] as const;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <section id="contact" className="px-4 pb-20 pt-16 md:pb-24 md:pt-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="room-panel p-8 md:p-10">
          <p className="section-kicker">CONTACT / SIGNAL PORTAL</p>
          <h2 className="room-heading mt-4 text-4xl md:text-5xl">
            Have a project in mind? Let&apos;s build it together.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--text-soft)]">
            I&apos;m open to full stack web projects, Laravel + React builds, REST API integrations,
            and creative frontend work. If you need something functional and well-crafted, reach out.
          </p>

          <div className="mt-8 space-y-4">
            {contactHighlights.map(({ label, value, icon: Icon }) => (
              <div key={label} className="floating-panel">
                <div className="icon-badge">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="room-panel p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="form-input"
                required
                type="text"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="form-input"
                required
                type="email"
              />
            </div>

            <div>
              <label htmlFor="message" className="form-label">
                Project brief
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me what you want to build."
                className="form-input min-h-40 resize-none"
                required
              />
            </div>

            <button type="submit" className="primary-cta">
              Send message
              <Send size={18} />
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-[var(--text-muted)]">
            Built with React, TypeScript, Tailwind CSS, Three.js, and Laravel on the backend.
          </div>
        </div>
      </div>
    </section>
  );
}
