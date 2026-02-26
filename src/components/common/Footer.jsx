// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { HiMail, HiPhone, HiLocationMarker, HiArrowRight } from "react-icons/hi";

const Footer = () => {
  const year = new Date().getFullYear();

  const sections = [
    { title: "Product", links: ["Features", "Pricing", "Integrations", "API"] },
    { title: "Resources", links: ["Docs", "Tutorials", "Blog", "Support"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Privacy Policy"] },
  ];

  return (
    <footer className="relative overflow-hidden bg-dark-950 text-dark-300">
      {/* Neon Glow Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.6)]">
                  <span className="text-white font-extrabold text-xl">L</span>
                </div>
                <div className="absolute -inset-2 bg-primary-500/10 blur-2xl rounded-3xl -z-10" />
              </div>
              <div className="leading-tight">
                <p className="text-cyan-900 text-2xl font-extrabold">
                  LMS <span className="font-light text-dark-400">System</span>
                </p>
                <p className="text-sm text-dark-400">Learn • Teach • Manage</p>
              </div>
            </div>

            <p className="text-sm text-dark-300/90 leading-relaxed">
              Empower education with a modern LMS. Manage courses, assignments, and communication effortlessly.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {[
                { icon: <HiMail />, text: "support@lms.com" },
                { icon: <HiPhone />, text: "+1 (000) 000-0000" },
                { icon: <HiLocationMarker />, text: "Your City, Country" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm hover:text-cyan-900 transition-colors duration-200"
                >
                  <span className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    {React.cloneElement(item.icon, { className: "w-5 h-5 text-white/80" })}
                  </span>
                  <span className="truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links + CTA */}
          <div className="lg:col-span-8 space-y-10">

            {/* Sections */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-white font-bold mb-4 border-b border-white/10 pb-1">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((label) => (
                      <li key={label}>
                        <a
                          href="#"
                          className="text-sm text-dark-300 hover:text-cyan-900 transition-colors duration-200"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Card */}
            <div className="relative p-6 sm:p-8 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300">
              <div>
                <p className="text-white font-bold text-lg">Ready to get started?</p>
                <p className="text-dark-300 mt-1 text-sm">
                  Sign up and start learning or teaching in minutes.
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
              >
                Create Account <HiArrowRight className="w-5 h-5" />
              </Link>
              {/* Neon underline */}
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 rounded-full animate-pulse-slow" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-dark-400">
          <p className="text-center sm:text-left">&copy; {year} LMS System. All rights reserved.</p>
          <div className="flex gap-5">
            {["Terms", "Privacy", "Support"].map((link) => (
              <a key={link} href="#" className="hover:text-sky-900 transition-colors duration-200">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
