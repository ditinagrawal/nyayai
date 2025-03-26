import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What makes your chat platform different?',
    answer: 'Our platform uses advanced AI to understand context and provide intelligent responses, making communication more efficient and productive.'
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required.'
  },
  {
    question: 'How secure is the platform?',
    answer: 'We use enterprise-grade encryption and security measures to ensure your data is always protected.'
  },
  {
    question: 'Can I integrate with other tools?',
    answer: 'Yes, we offer integrations with popular tools like Slack, Jira, and more.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Everything you need to know about our platform</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-6 bg-white border border-gray-100 rounded-lg mt-2">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}