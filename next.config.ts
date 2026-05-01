import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose Razorpay key to the browser bundle
  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? '',
  },
};

export default nextConfig;