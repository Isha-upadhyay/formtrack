# 🚀 FormTrack — Premium SaaS Lead Generation & Form Builder

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**FormTrack** is a world-class, premium SaaS platform designed to help businesses track leads, build high-conversion forms, and analyze UTM sources with precision. Built with a modern aesthetic and extreme performance in mind.

---

## ✨ Key Features

- 🏗️ **Advanced Form Builder**: Drag-and-drop experience with live Desktop & Mobile previews.
- 🎯 **UTM Tracking**: Automatic capture of `utm_source`, `utm_medium`, `utm_campaign` for every lead.
- 📊 **Radiant Dashboard**: High-level overview of lead trends, form performance, and conversion rates.
- 🌓 **World-Class UI**: Seamless Light/Dark mode support with a premium "Glassmorphism" aesthetic.
- ⚡ **Multi-Step Forms**: Support for complex user journeys with easy-to-configure steps.
- 📧 **Auto-Replies**: Automatic email responses to leads with custom branding.
- 💳 **Billing Integration**: Integrated with Razorpay for seamless Pro upgrades.
- 🔒 **Secure Auth**: Powered by Supabase Auth with Organization-based workspaces.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Native CSS variables)
- **Database/Auth**: [Supabase](https://supabase.com/) (PostgreSQL & SSR Auth)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Plus Jakarta Sans (Headings) & Inter (Body)
- **Payments**: [Razorpay](https://razorpay.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Supabase account
- A Razorpay account (for payments)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/formtrack.git
   cd formtrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the magic.

---

## 🎨 UI/UX Design System

FormTrack follows a strict "Premium SaaS" design language:
- **Glass-Cards**: Utilizing backdrop-blur for a depth-rich experience.
- **Radiant Glows**: Subtle HSL-based glows to guide user attention.
- **Syne & Jakarta Typography**: A blend of geometric and humanist fonts for a pro feel.
- **Dynamic Micro-animations**: Entrance and hover effects for a responsive feel.

---


## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by **Isha Upadhyay**
