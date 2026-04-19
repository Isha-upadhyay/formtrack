import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
      `}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="bg-[#080A0E] text-[#FAFAF8] overflow-x-hidden">

        {/* ── NAV ────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between bg-[#080A0E]/80 backdrop-blur-xl border-b border-white/[0.04]">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 bg-[#2A5BFF] rounded-[10px] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_20px_rgba(42,91,255,0.4)]"
              style={{ fontFamily: "'Syne', sans-serif" }}>F</div>
            <span className="font-bold text-lg text-white" style={{ fontFamily: "'Syne', sans-serif" }}>FormTrack</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-[#B4B4AA] text-sm hover:text-white transition-colors no-underline">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="hidden sm:block px-5 py-2 border border-white/[0.12] rounded-lg text-[#B4B4AA] text-sm hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all no-underline font-medium">
              Sign In
            </Link>
            <Link href="/signup"
              className="px-5 py-2 bg-[#2A5BFF] rounded-lg text-white text-sm font-semibold hover:bg-[#5B82FF] transition-all shadow-[0_4px_20px_rgba(42,91,255,0.3)] hover:shadow-[0_4px_30px_rgba(42,91,255,0.5)] hover:-translate-y-px no-underline">
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_600px_at_50%_0%,rgba(42,91,255,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_400px_400px_at_80%_60%,rgba(0,229,160,0.04)_0%,transparent_60%)]" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)'
            }} />

          <div className="relative z-10 text-center max-w-[860px] mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#2A5BFF]/10 border border-[#2A5BFF]/25 px-4 py-1.5 rounded-full mb-8 text-[#5B82FF] text-sm font-medium">
              <span className="w-1.5 h-1.5 bg-[#00E5A0] rounded-full animate-pulse" />
              Built for Indian businesses · ₹999/mo
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(48px,7vw,88px)] font-extrabold leading-[1.0] tracking-[-0.03em] mb-7"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="block text-white">Every lead, tracked.</span>
              <span className="block"
                style={{ background: 'linear-gradient(135deg, #5B82FF 0%, #00E5A0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                No more guessing.
              </span>
            </h1>

            <p className="text-lg text-[#B4B4AA] max-w-[520px] mx-auto mb-11 leading-[1.7] font-light">
              Build embeddable lead forms in minutes. See exactly which ad, campaign, or source sent each lead — in plain English. Stop trusting your agency blindly.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-10">
              <Link href="/signup"
                className="flex items-center gap-2 px-8 py-4 bg-[#2A5BFF] rounded-xl text-white text-[15px] font-semibold no-underline transition-all shadow-[0_8px_32px_rgba(42,91,255,0.35)] hover:bg-[#5B82FF] hover:shadow-[0_8px_40px_rgba(42,91,255,0.55)] hover:-translate-y-0.5">
                Start for Free <span className="text-lg">→</span>
              </Link>
              <a href="#how-it-works"
                className="flex items-center gap-2 px-7 py-4 border border-white/[0.12] rounded-xl text-[#B4B4AA] text-[15px] font-medium no-underline transition-all hover:border-white/30 hover:text-white hover:bg-white/[0.04]">
                See how it works <span className="text-sm opacity-60">↓</span>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-4 text-[13px] text-[#6E6E64]">
              <div className="flex">
                {['linear-gradient(135deg,#2A5BFF,#5B82FF)', 'linear-gradient(135deg,#00E5A0,#2A5BFF)', 'linear-gradient(135deg,#FF6B6B,#FF8B8B)', 'linear-gradient(135deg,#F59E0B,#FFB866)'].map((bg, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#080A0E] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: bg, marginLeft: i === 0 ? 0 : '-8px' }}>
                    {['R', 'P', 'A', 'S'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-yellow-400 text-xs tracking-widest">★★★★★</div>
                <span>Trusted by 500+ businesses</span>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative z-10 w-full max-w-[900px] mx-auto mt-20">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(42,91,255,0.08)]">
              {/* Browser bar */}
              <div className="bg-[#1A1C24] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 bg-white/[0.06] rounded-md px-3 py-1.5 text-[11px] text-[#6E6E64] font-mono">
                  formtrack.app/dashboard/leads
                </div>
              </div>
              {/* Dashboard body */}
              <div className="bg-[#1E2028] p-5">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[['Total Leads', '847', '#FAFAF8'], ['From Ads', '612', '#5B82FF'], ['Today', '24', '#00E5A0'], ['Conversion', '72%', '#FAFAF8']].map(([label, val, color]) => (
                    <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5">
                      <p className="text-[10px] text-[#6E6E64] mb-1.5 uppercase tracking-wider">{label}</p>
                      <p className="font-bold text-2xl" style={{ fontFamily: "'Syne',sans-serif", color }}>{val}</p>
                    </div>
                  ))}
                </div>
                {/* Leads */}
                <div className="flex flex-col gap-2">
                  {[
                    { init: 'RS', name: 'Rahul Sharma', source: '🎯 Lead came from Google Ads — Campaign: "diwali_sale"', tag: 'google', tagColor: 'rgba(42,91,255,0.15)', tagText: '#5B82FF', bg: 'linear-gradient(135deg,#2A5BFF,#5B82FF)' },
                    { init: 'PK', name: 'Priya Kapoor', source: '🎯 Lead came from Facebook Ads via social media — paid search', tag: 'facebook', tagColor: 'rgba(139,94,255,0.15)', tagText: '#8B9EFF', bg: 'linear-gradient(135deg,#8B5CF6,#5B82FF)' },
                    { init: 'AV', name: 'Amit Verma', source: '🎯 Lead came from Instagram Ads — Ad variant: "reel_aug_2"', tag: 'instagram', tagColor: 'rgba(255,107,107,0.15)', tagText: '#FF8B8B', bg: 'linear-gradient(135deg,#F59E0B,#FF6B6B)' },
                  ].map(lead => (
                    <div key={lead.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: lead.bg }}>{lead.init}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{lead.name}</p>
                        <p className="text-[11px] text-[#6E6E64] mt-0.5 truncate">{lead.source}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: lead.tagColor, color: lead.tagText }}>{lead.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LOGOS STRIP ────────────────────────────────────────────────── */}
        <div className="border-y border-white/[0.05] bg-white/[0.01] py-8">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-center flex-wrap">
            {['Digital Agencies', 'Real Estate', 'Ed-Tech', 'Healthcare', 'E-Commerce', 'Finance'].map((cat, i, arr) => (
              <span key={cat} className="px-8 py-3 text-[13px] font-semibold text-[#6E6E64] tracking-wider uppercase"
                style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ───────────────────────────────────────────────────── */}
        <section id="features" className="py-24 px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5B82FF] block mb-4">Features</span>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] leading-[1.1] mb-5"
                style={{ fontFamily: "'Syne',sans-serif" }}>
                Everything you need.<br />Nothing you don't.
              </h2>
              <p className="text-[17px] text-[#B4B4AA] max-w-[480px] leading-[1.7] font-light">
                Stop getting vague reports from your agency. See the truth yourself, in real-time.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                { icon: '🎯', title: 'UTM Source Tracking', desc: 'Every lead auto-tagged with Google Ads, Facebook, Instagram, or Direct. Plain English summaries — no jargon, no guesswork.', pill: '"Lead came from Google Ads — campaign: diwali_sale"' },
                { icon: '📋', title: 'Drag & Drop Builder', desc: '8 ready-made templates. Custom fields, colors, fonts. Embed on any website with one line of code.', pill: '1-line embed · 8 templates · Custom branding' },
                { icon: '⚡', title: 'Instant Notifications', desc: 'Get an email the moment a lead submits. Never miss a hot prospect. Configure per-form notification emails.', pill: 'Real-time email alerts on every submission' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Leads by source, by day, by campaign. Beautiful charts. Know which ad is actually converting.', pill: 'Charts · Source breakdown · 7-day trends' },
                { icon: '⬇️', title: 'One-Click CSV Export', desc: 'Download all leads as Excel-ready spreadsheet. Filter first, then export exactly what you need.', pill: 'Filtered export · Excel-ready · Instant' },
                { icon: '🔒', title: 'Secure & Private', desc: 'Your data stays yours. Row-level security, no third-party tracking, no ads. Built on Supabase.', pill: 'RLS · No ads · No data selling · Ever' },
              ].map(f => (
                <div key={f.title} className="bg-[#080A0E] p-10 group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A5BFF]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 bg-white/[0.04] border border-white/[0.08]">{f.icon}</div>
                  <h3 className="font-bold text-lg mb-3 text-white" style={{ fontFamily: "'Syne',sans-serif" }}>{f.title}</h3>
                  <p className="text-sm text-[#B4B4AA] leading-[1.7] mb-5 font-light">{f.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E64] bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#00E5A0] rounded-full" />{f.pill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-6 md:px-10 bg-white/[0.01] border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5B82FF] block mb-4">How it works</span>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: "'Syne',sans-serif" }}>
                Set up in 5 minutes.<br />Track forever.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: '01', title: 'Create your form', desc: 'Pick a template, customize fields and branding, set your notification email. Takes 2 minutes.' },
                { n: '02', title: 'Embed on your website', desc: 'Copy one line of code. Paste it anywhere — WordPress, Wix, Webflow, plain HTML. Done.' },
                { n: '03', title: 'See where leads come from', desc: 'Every submission shows exactly which ad, campaign, keyword, or source sent that lead. In plain English.' },
              ].map((step, i) => (
                <div key={step.n} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-8 border-t border-dashed border-white/[0.12] z-10" style={{ transform: 'translateX(-50%)' }} />
                  )}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#2A5BFF] flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(42,91,255,0.4)]"
                      style={{ fontFamily: "'Syne',sans-serif" }}>
                      <span className="font-bold text-sm text-white">{step.n}</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{step.title}</h3>
                    <p className="text-sm text-[#B4B4AA] leading-[1.7] font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Code snippet */}
            <div className="mt-12 bg-[#1E2028] border border-white/[0.06] rounded-2xl p-6 max-w-lg">
              <p className="text-[11px] text-[#6E6E64] mb-3 uppercase tracking-wider">Embed code — just paste this</p>
              <code className="text-sm font-mono">
                <span className="text-[#00E5A0]">&lt;script</span>
                <span className="text-[#5B82FF]"> src</span>
                <span className="text-white">=</span>
                <span className="text-[#FFB866]">"formtrack.app/embed.js"</span>
                <span className="text-[#5B82FF]"> data-form-id</span>
                <span className="text-white">=</span>
                <span className="text-[#FFB866]">"your-id"</span>
                <span className="text-[#00E5A0]">&gt;&lt;/script&gt;</span>
              </code>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5B82FF] block mb-4">What people say</span>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: "'Syne',sans-serif" }}>
                Real businesses.<br />Real results.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { text: '"Pehle agency bolta tha 50 leads aaye Google se. FormTrack se dekha toh sirf 12 real leads the. Paise waapis maange."', name: 'Ravi Gupta', role: 'Real Estate, Delhi', bg: 'linear-gradient(135deg,#2A5BFF,#5B82FF)', init: 'RG' },
                { text: '"Setup took literally 5 minutes. Now I can see every lead source in my dashboard. My agency knows I\'m watching now."', name: 'Pooja Shah', role: 'Coaching Institute, Mumbai', bg: 'linear-gradient(135deg,#00E5A0,#2A5BFF)', init: 'PS' },
                { text: '"Best ₹999 I spend every month. Stopped paying for fake Facebook leads. ROI on FormTrack is literally infinite."', name: 'Arjun Khanna', role: 'E-commerce, Bangalore', bg: 'linear-gradient(135deg,#F59E0B,#FF6B6B)', init: 'AK' },
              ].map(t => (
                <div key={t.name} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-0.5 transition-all">
                  <div className="text-yellow-400 text-sm tracking-[2px] mb-4">★★★★★</div>
                  <p className="text-sm text-[#B4B4AA] leading-[1.7] mb-5 italic font-light">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: t.bg }}>{t.init}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-[#6E6E64]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-6 md:px-10 bg-white/[0.01] border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5B82FF] block mb-4">Pricing</span>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: "'Syne',sans-serif" }}>Simple. Honest. Fair.</h2>
              <p className="text-[17px] text-[#B4B4AA] mt-4 font-light">No hidden fees. No lock-in. Cancel anytime.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-[700px] mx-auto">
              {/* Free */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-10">
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>Free</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-extrabold text-5xl tracking-[-0.03em]" style={{ fontFamily: "'Syne',sans-serif" }}>₹0</span>
                  <span className="text-base text-white/50 mb-1.5">/mo</span>
                </div>
                <p className="text-sm text-white/40 mb-7">Perfect to get started</p>
                <ul className="space-y-3 mb-8">
                  {['2 forms', '100 leads/month', 'UTM source tracking', 'CSV export', 'Lead notifications'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#B4B4AA]">
                      <span className="text-[#00E5A0] font-bold text-xs">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className="block w-full text-center py-3 border border-white/[0.12] rounded-xl text-[#B4B4AA] text-sm font-semibold no-underline hover:border-white/30 hover:text-white hover:bg-white/[0.04] transition-all">
                  Get Started Free
                </Link>
              </div>
              {/* Pro */}
              <div className="bg-[#2A5BFF] border border-[#2A5BFF] rounded-2xl p-10 relative shadow-[0_20px_60px_rgba(42,91,255,0.3)]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap tracking-wider">
                  🔥 MOST POPULAR
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>Pro</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-extrabold text-5xl tracking-[-0.03em]" style={{ fontFamily: "'Syne',sans-serif" }}>₹999</span>
                  <span className="text-base text-white/60 mb-1.5">/mo</span>
                </div>
                <p className="text-sm text-white/60 mb-7">For serious businesses</p>
                <ul className="space-y-3 mb-8">
                  {['Unlimited forms', 'Unlimited leads', 'Everything in Free', 'Priority support', 'Early access features'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white">
                      <span className="text-yellow-300 font-bold text-xs">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className="block w-full text-center py-3 bg-white text-[#2A5BFF] rounded-xl text-sm font-bold no-underline hover:bg-blue-50 hover:-translate-y-px transition-all">
                  Start Free Trial →
                </Link>
              </div>
            </div>
            <p className="text-center mt-7 text-sm text-[#6E6E64]">
              💳 Powered by Razorpay · Secure Indian payment · No foreign card needed
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-10">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-14 text-center">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[#5B82FF] block mb-4">FAQ</span>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] leading-[1.1]"
                style={{ fontFamily: "'Syne',sans-serif" }}>Questions answered.</h2>
            </div>
            <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
              {[
                { q: 'Do I need to know coding?', a: 'Bilkul nahi. Form banane mein 2 minutes lagte hain. Ek line ka code copy-paste karo apni website pe — bas. No developer needed.' },
                { q: 'My agency gives me reports already. Why use FormTrack?', a: 'Agency ki report unka data hota hai — aap unpe depend hain. FormTrack aapka apna independent data hai, directly aapke form se. Verify karo khud.' },
                { q: 'Which websites can I embed on?', a: 'Koi bhi website — WordPress, Wix, Webflow, Shopify, plain HTML. Ek script tag chahiye bas. Koi plugin install nahi, koi theme change nahi.' },
                { q: 'What is UTM tracking exactly?', a: 'UTM parameters URL mein chhupe hote hain jo batate hain lead kahan se aayi — Google Ads, Facebook, email, etc. FormTrack ye automatically capture karta hai.' },
                { q: 'Is my data safe?', a: 'Haan. Data Supabase pe store hota hai with row-level security. Hum kabhi aapka data sell nahi karte, koi ads nahi, koi third-party tracking nahi.' },
              ].map((faq, i, arr) => (
                <details key={faq.q} className={`group ${i < arr.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
                  <summary className="flex items-center justify-between px-7 py-5 cursor-pointer text-white font-medium text-[15px] hover:bg-white/[0.02] transition-colors list-none select-none">
                    {faq.q}
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[#B4B4AA] text-lg flex-shrink-0 group-open:rotate-45 group-open:bg-[#2A5BFF] group-open:text-white transition-all">+</span>
                  </summary>
                  <div className="px-7 pb-5">
                    <p className="text-sm text-[#B4B4AA] leading-[1.7] font-light">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
        <div className="mx-6 md:mx-10 mb-20 rounded-3xl bg-gradient-to-br from-[#2A5BFF]/15 to-[#00E5A0]/5 border border-[#2A5BFF]/20 py-20 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(42,91,255,0.12)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.02em] mb-4 relative z-10"
            style={{ fontFamily: "'Syne',sans-serif" }}>
            Ready to see the truth?
          </h2>
          <p className="text-[17px] text-[#B4B4AA] mb-10 font-light relative z-10">
            Join businesses who stopped guessing and started knowing exactly where their leads come from.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
            <Link href="/signup"
              className="flex items-center gap-2 px-10 py-4 bg-[#2A5BFF] rounded-xl text-white text-[15px] font-semibold no-underline transition-all shadow-[0_8px_32px_rgba(42,91,255,0.35)] hover:bg-[#5B82FF] hover:shadow-[0_8px_40px_rgba(42,91,255,0.55)] hover:-translate-y-0.5">
              Create Free Account →
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-8 py-4 border border-white/[0.12] rounded-xl text-[#B4B4AA] text-[15px] font-medium no-underline transition-all hover:border-white/30 hover:text-white hover:bg-white/[0.04]">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#6E6E64] relative z-10">Free forever · No credit card · Setup in 5 minutes</p>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] py-10 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2A5BFF] rounded-lg flex items-center justify-center font-bold text-xs text-white">F</div>
            <span className="font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>FormTrack</span>
            <span className="text-[#6E6E64] text-sm ml-2">© 2025</span>
          </div>
          <div className="flex items-center gap-6">
            {['Features', 'Pricing', 'Sign Up', 'Login'].map(l => (
              <a key={l} href={l === 'Sign Up' ? '/signup' : l === 'Login' ? '/login' : `#${l.toLowerCase()}`}
                className="text-sm text-[#6E6E64] hover:text-white transition-colors no-underline">{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}