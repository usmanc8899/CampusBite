import React from "react";

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none text-slate-600">
          <p className="lead text-xl text-slate-800 mb-8">
            Your privacy is critically important to us. At CampusBite, we have a few fundamental principles about how we handle your personal data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">1. Information We Collect</h2>
          <p className="mb-6">
            We only collect information about you if we have a reason to do so—for example, to provide our Services, to communicate with you, or to make our Services better.
          </p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Basic Account Information:</strong> To process your orders, we require basic information such as a name, email address, and student ID.</li>
            <li><strong>Transaction Information:</strong> Since you buy food from us, we collect information relating to your transactions, including order details and billing information.</li>
            <li><strong>Location Information:</strong> We may determine the campus building where you'd like your food delivered.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">2. How We Use Information</h2>
          <p className="mb-6">
            We use the information we collect to provide our Services—for example, to set up and maintain your account, process payments and orders, and to notify the cafeteria.
          </p>
          <p className="mb-8">
            We also use the information to further develop our services, monitor trends, and enhance security.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">3. Security</h2>
          <p className="mb-8">
            While no online service is 100% secure, we work very hard to protect information about you against unauthorized access, use, alteration, or destruction, and take reasonable measures to do so. Our systems use enterprise-grade encryption over HTTPS.
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-12">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Have Questions?</h3>
            <p className="text-slate-600 mb-0">
              If you have a question about this Privacy Policy, please <a href="/contact" className="text-primary font-semibold hover:underline">contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
