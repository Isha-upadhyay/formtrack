import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold text-gray-900 text-lg">FormTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Sign In</Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Get Started Free</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          🚀 Stop trusting your agency blindly
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Know exactly where<br />every lead comes from
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Build embeddable lead forms in minutes. Every submission arrives with a plain-English source explanation — verify your agency results independently.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Start for Free
          </Link>
          <Link href="/login" className="text-gray-600 px-8 py-3 rounded-xl font-semibold text-lg border border-gray-200 hover:border-gray-300 transition">
            Sign In
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-24 text-left">
          {[
            { icon: '🎯', title: 'Source Tracking', desc: 'Every lead tagged with UTM source, medium, and campaign automatically.' },
            { icon: '📋', title: 'Form Builder', desc: '8 templates. Custom fields. Custom branding. Embed anywhere.' },
            { icon: '📧', title: 'Lead Notifications', desc: 'Get an email the moment a lead submits. Never miss a hot prospect.' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}