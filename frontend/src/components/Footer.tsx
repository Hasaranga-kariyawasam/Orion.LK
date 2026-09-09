import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#161B22]/90 backdrop-blur-md text-[#8B949E] pt-16 pb-8 border-t border-[#30363D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            <a href="/" className="flex items-center shrink-0">
              <span className="text-3xl font-black tracking-tight flex items-baseline" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className="text-white">O</span>
                <span className="text-white">RION</span>
                <span className="text-[#2ee661] ml-1 text-2xl" style={{ textShadow: '0 0 10px rgba(46, 230, 97, 0.5)' }}>.lk</span>
              </span>
            </a>
            
            <div>
              <p className="text-white font-bold text-sm mb-1">Got any Queries? Call Us!</p>
              <p className="text-[#2ee661] font-black text-xl drop-shadow-[0_0_5px_rgba(0,255,85,0.3)]">+94 777 57 46 43</p>
            </div>

            <div className="flex flex-col gap-3 text-xs text-[#8B949E]">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-[#2ee661]" />
                <p>No. 07, 2nd Cross Street, Talbot Town,<br/>Galle, Sri Lanka.</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#2ee661]" />
                <p>Whatsapp - 0777 57 46 43</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#2ee661]" />
                <p>orion.lk.store@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:bg-[#2ee661]/10 hover:border-[#2ee661] hover:text-white transition-colors"><Facebook size={14} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:bg-[#2ee661]/10 hover:border-[#2ee661] hover:text-white transition-colors"><Twitter size={14} /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:bg-[#2ee661]/10 hover:border-[#2ee661] hover:text-white transition-colors"><Youtube size={14} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:bg-[#2ee661]/10 hover:border-[#2ee661] hover:text-white transition-colors"><Instagram size={14} /></a>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-white">Popular Categories</h3>
            <ul className="flex flex-col gap-3 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Smart Watch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Earbuds</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Power Banks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Headphones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cables</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Storage Devices</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-white">Support</h3>
            <ul className="flex flex-col gap-3 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">My Account</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our contacts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Return and Exchange Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms and Conditions</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-white">Subscribe to our Newsletter</h3>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white text-gray-900 px-4 py-2.5 rounded text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#f0364c]"
              />
              <button 
                type="button" 
                className="bg-[#f0364c] text-white font-semibold text-sm px-4 py-2.5 rounded hover:bg-red-600 transition-colors self-start"
              >
                Submit
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a2a2a] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-500">© Copyright 2026 MY MEMORY. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white rounded border border-gray-200 text-[8px] font-bold text-blue-800 flex items-center justify-center">VISA</div>
            <div className="w-8 h-5 bg-white rounded border border-gray-200 text-[6px] font-bold text-red-500 flex items-center justify-center">MasterCard</div>
            <div className="w-8 h-5 bg-white rounded border border-gray-200 text-[8px] font-bold text-cyan-500 flex items-center justify-center">AMEX</div>
            <div className="w-8 h-5 bg-[#333] rounded border border-gray-600 text-[8px] font-bold text-white flex items-center justify-center">Apple</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
