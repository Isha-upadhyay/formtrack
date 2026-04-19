import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-gray-900 text-lg">FormTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 hover:text-gray-900 text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 text-sm">How it works</a>
            <a href="#pricing" className="text-gray-500 hover:text-gray-900 text-sm">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block">Sign In</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-100">
          🇮🇳 Built for Indian businesses
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
          Know exactly where<br />
          <span className="text-blue-600">every lead comes from</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Build embeddable lead forms in minutes. Every submission arrives with a plain-English source summary — stop trusting your agency blindly.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Start for Free →
          </Link>
          <Link href="/login" className="text-gray-600 px-8 py-3.5 rounded-xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required · Free plan forever</p>

        {/* ── Mock UI Preview ──────────────────────────────────────────────── */}
        <div className="mt-16 bg-gray-900 rounded-2xl p-1 shadow-2xl shadow-gray-200 max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-4">
            {/* Browser bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-gray-700 rounded-md h-6 flex items-center px-3">
                <span className="text-gray-400 text-xs">formtrack.app/dashboard</span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[['Total Forms', '3'], ['Active', '2'], ['Total Leads', '147'], ['Today', '12']].map(([label, val]) => (
                <div key={label} className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-white font-bold text-xl">{val}</p>
                </div>
              ))}
            </div>
            {/* Mock leads */}
            <div className="space-y-2">
              {[
                { name: 'Rahul Sharma', source: '🎯 Lead came from Google Ads via paid search — Campaign: "summer_sale"', tag: 'google' },
                { name: 'Priya Singh', source: '🎯 Lead came from Facebook Ads via social media', tag: 'facebook' },
                { name: 'Amit Kumar', source: '🎯 Direct visit — no campaign tracking detected', tag: 'direct' },
              ].map((lead) => (
                <div key={lead.name} className="bg-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{lead.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{lead.source}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.tag === 'google' ? 'bg-blue-500/20 text-blue-300' :
                    lead.tag === 'facebook' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-gray-600 text-gray-300'
                  }`}>{lead.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider font-medium">Trusted by businesses across India</p>
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
            {['Digital Agencies', 'Real Estate', 'Ed-Tech', 'Healthcare', 'E-Commerce'].map(cat => (
              <span key={cat} className="text-gray-500 font-semibold text-sm">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to track leads</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Stop getting vague reports from your agency. See the truth yourself.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🎯',
              title: 'UTM Source Tracking',
              desc: 'Every lead automatically tagged with Google Ads, Facebook, Instagram, or Direct source. Plain English — no jargon.',
              highlight: '"Lead came from Google Ads — Campaign: summer_sale"'
            },
            {
              icon: '📋',
              title: 'Drag & Drop Form Builder',
              desc: '8 ready-made templates. Add custom fields, change colors, fonts, and embed on any website with one line of code.',
              highlight: '8 templates · Custom branding · 1-line embed'
            },
            {
              icon: '📧',
              title: 'Instant Lead Notifications',
              desc: 'Get an email the moment someone submits your form. Never miss a hot lead again.',
              highlight: 'Instant email alerts on every submission'
            },
            {
              icon: '📊',
              title: 'Analytics Dashboard',
              desc: 'See leads by source, by day, and by form. Know which campaign is actually working.',
              highlight: 'Charts · Breakdowns · Trends'
            },
            {
              icon: '⬇️',
              title: 'CSV Export',
              desc: 'Download all your leads as a spreadsheet anytime. Share with your team or upload to any CRM.',
              highlight: 'Excel-ready export with one click'
            },
            {
              icon: '🔒',
              title: 'Secure & Private',
              desc: 'Your data stays yours. Row-level security, no third-party tracking, hosted on Supabase.',
              highlight: 'RLS · No ads · No data selling'
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
              <p className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">{f.highlight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Set up in 5 minutes</h2>
            <p className="text-gray-500 text-lg">No developers needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create your form', desc: 'Pick a template, customize fields and branding, set your notification email.' },
              { step: '2', title: 'Embed on your website', desc: 'Copy one line of code. Paste it anywhere — WordPress, Wix, HTML — done.' },
              { step: '3', title: 'See where leads come from', desc: 'Every submission shows exactly which ad, campaign, or source sent that lead.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-extrabold mx-auto mb-4">{s.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-gray-500 text-lg">No hidden fees. No surprises.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 text-xl mb-1">Free</h3>
            <p className="text-4xl font-extrabold text-gray-900 mb-1">₹0<span className="text-base font-normal text-gray-400">/mo</span></p>
            <p className="text-gray-500 text-sm mb-6">Perfect to get started</p>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {['2 forms', '100 leads/month', 'UTM source tracking', 'CSV export', 'Lead notifications'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full text-center border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition">
              Get Started Free
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-blue-600 border-2 border-blue-600 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="font-bold text-white text-xl mb-1">Pro</h3>
            <p className="text-4xl font-extrabold text-white mb-1">₹999<span className="text-base font-normal text-blue-200">/mo</span></p>
            <p className="text-blue-200 text-sm mb-6">For serious businesses</p>
            <ul className="space-y-3 text-sm text-white mb-8">
              {['Unlimited forms', 'Unlimited leads', 'Everything in Free', 'Priority support', 'Early access to new features'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-yellow-300 font-bold">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full text-center bg-white text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Do I need to know coding to use FormTrack?', a: 'No. Form banane mein 2 minutes lagte hain. Ek line ka code copy-paste karo apni website pe — bas.' },
              { q: 'My agency gives me reports already. Why use FormTrack?', a: 'Agency ki report unka data hota hai. FormTrack aapka apna independent data hai — directly aapke form se. Verify karo khud.' },
              { q: 'Which websites can I embed FormTrack forms on?', a: 'Koi bhi website — WordPress, Wix, Webflow, HTML, Shopify, anywhere. Bas ek script tag chahiye.' },
              { q: 'What is UTM tracking?', a: 'UTM parameters URL mein chhupe hote hain jo batate hain lead kahan se aayi — Google Ads, Facebook, email, etc. FormTrack ye automatically capture karta hai.' },
              { q: 'Is my data safe?', a: 'Haan. Aapka data Supabase pe store hota hai with row-level security. Hum kabhi aapka data sell nahi karte.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to see the truth?</h2>
          <p className="text-gray-500 text-lg mb-8">Join businesses who stopped guessing and started knowing.</p>
          <Link href="/signup" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Create Free Account →
          </Link>
          <p className="text-sm text-gray-400 mt-4">Free forever · No credit card · Setup in 5 minutes</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">F</div>
            <span className="font-bold text-gray-900">FormTrack</span>
            <span className="text-gray-400 text-sm ml-2">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <Link href="/login" className="hover:text-gray-900">Login</Link>
            <Link href="/signup" className="hover:text-gray-900">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}