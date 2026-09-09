import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_DATA = [
  {
    question: "What is the warranty period for this hardware?",
    answer: "Most of our premium gaming hardware comes with a standard 1-year manufacturer warranty covering any defects in materials or workmanship under normal use. Some select items feature extended 3-year warranties as noted in the product specifications."
  },
  {
    question: "Is this compatible with my current PC setup?",
    answer: "Our components use standard industry interfaces (like PCIe, SATA, standard USB). Please check the 'Specifications' tab to ensure compatibility with your motherboard, power supply wattage, and case dimensions before purchasing."
  },
  {
    question: "What happens if I receive a defective item?",
    answer: "If your item arrives defective, please contact our support team within 7 days of delivery. We will arrange a free return pickup and dispatch a replacement immediately upon verifying the defect."
  },
  {
    question: "Do you offer installation services?",
    answer: "Currently, we only provide delivery of the hardware components. However, we have a network of trusted partner technicians that we can recommend for professional installation services in major cities."
  }
];

const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="mt-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 uppercase mb-6 tracking-tight">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {FAQ_DATA.map((faq, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300"
          >
            <button 
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-4 md:p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
              <ChevronDown 
                className={`text-gray-500 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                size={20} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 md:p-5 text-gray-600 text-sm leading-relaxed bg-white border-t border-gray-100">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;
