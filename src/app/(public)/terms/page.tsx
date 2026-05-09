import React from "react";

export default function TermsPage() {
  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12 border-b border-slate-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium">Effective Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none text-slate-600 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using our Services, you agree to be bound by all of these Terms. If you don't agree to all of the terms and conditions, you may not use our Services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
            <p>
              CampusBite provides a cafeteria ordering and payment processing platform designed specifically for university environments. The Service connects you with campus cafeterias to facilitate ordering and fulfillment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
            <p>
              You must register for an account to use most features of CampusBite. You agree to provide accurate, complete, and current information when creating an account. You are responsible for safeguarding the password that you use to access the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Orders and Payments</h2>
            <p>
              All orders are subject to availability. Prices for all products are subject to change without notice. Once an order is placed, it may not be modified or cancelled unless explicitly permitted by the relevant cafeteria's policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Termination</h2>
            <p>
              We may terminate or suspend your access to all or any part of our Services at any time, with or without cause, with or without notice, effective immediately.
            </p>
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mt-12">
            <p className="text-slate-700 font-medium mb-0">
              For further clarification regarding our terms, please direct inquiries to our <a href="/contact" className="text-primary font-bold hover:underline">legal support team</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
