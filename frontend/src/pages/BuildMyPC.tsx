import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { motion } from 'motion/react';
import { ChevronRight, Settings, Download, ShoppingCart, Trash2, Cpu, HardDrive, MemoryStick, Maximize, Box, Battery, Wind, Server, Monitor, Keyboard, Mouse, PlusCircle, Search } from 'lucide-react';
import { formatLKR, MOCK_PRODUCTS } from '../data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BUILD_CATEGORIES = [
  { id: 'processor', name: 'Processor', icon: Cpu, keywords: ['Processor', 'CPU'] },
  { id: 'motherboard', name: 'Motherboard', icon: Box, keywords: ['Motherboard'] },
  { id: 'memory', name: 'Memory', icon: MemoryStick, keywords: ['RAM', 'Memory'] },
  { id: 'graphics', name: 'Graphics card', icon: Maximize, keywords: ['Graphics', 'GPU', 'RTX', 'RX'] },
  { id: 'primary-storage', name: 'Primary storage', icon: HardDrive, keywords: ['SSD', 'NVMe', 'Storage'] },
  { id: 'extra-storage', name: 'Extra storage', icon: HardDrive, keywords: ['HDD', 'SSD'] },
  { id: 'power-supply', name: 'Power supply', icon: Battery, keywords: ['Power', 'PSU'] },
  { id: 'cpu-cooler', name: 'CPU cooler', icon: Wind, keywords: ['Cooler', 'Liquid'] },
  { id: 'computer-case', name: 'Computer case', icon: Server, keywords: ['Case', 'Chassis'] },
  { id: 'case-fans', name: 'Case fans', icon: Wind, keywords: ['Fan', 'RGB Fan'] },
  { id: 'monitor', name: 'Monitor', icon: Monitor, keywords: ['Monitor', 'Display'] },
  { id: 'keyboard', name: 'Keyboard', icon: Keyboard, keywords: ['Keyboard'] },
  { id: 'mouse', name: 'Mouse', icon: Mouse, keywords: ['Mouse'] },
  { id: 'ups', name: 'UPS', icon: Battery, keywords: ['UPS'] },
  { id: 'more', name: 'More products', icon: PlusCircle, keywords: ['Accessories'] },
];

export default function BuildMyPC() {
  const { buildItems, removeFromBuild, addToBuild, addToCart, buildTotal } = useShop();
  const [activeCategory, setActiveCategory] = useState(BUILD_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const { savedBuilds, saveBuild, loadBuild, deleteSavedBuild, setBuildItems } = useShop();

  // Find products matching active category
  const availableProducts = MOCK_PRODUCTS.filter(p => 
    activeCategory.keywords.some(kw => p.name.toLowerCase().includes(kw.toLowerCase()) || p.category.toLowerCase().includes(kw.toLowerCase()))
  ).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Add all build items to cart
  const handleAddAllToCart = () => {
    buildItems.forEach(item => addToCart(item, 1));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Main Header Background (Dark Gray / Black)
    doc.setFillColor(22, 27, 34); // #161b22
    doc.rect(0, 0, 210, 45, 'F');
    
    // Green Accent Bar at the bottom of the header
    doc.setFillColor(46, 230, 97); // #2ee661
    doc.rect(0, 43, 210, 2, 'F');
    
    // Left Text (Logo)
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    
    // Draw "ORION"
    doc.setTextColor(255, 255, 255); // White
    doc.text("ORION", 15, 24);
    
    // Draw ".lk" in Green
    doc.setTextColor(46, 230, 97); // Green #2ee661
    doc.setFontSize(20);
    // Rough offset calculation for ORION width
    doc.text(".lk", 47, 24);
    
    // Subtitle
    doc.setTextColor(200, 200, 200); // Light Gray
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("YOUR TRUSTED PC PARTNER", 15, 32);
    
    // Right Text (White/Gray)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ORION COMPUTERS", 195, 14, { align: "right" });
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("No 42, Galle Road, Colombo 03, Sri Lanka.", 195, 19, { align: "right" });
    doc.text("www.orion.lk | info@orion.lk", 195, 24, { align: "right" });
    doc.text("+94 11 234 5678 | +94 77 123 4567", 195, 29, { align: "right" });
    
    // Branch Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Kandy Branch :", 195, 36, { align: "right" });
    
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("No 15, Dalada Vidiya, Kandy, Sri Lanka.", 195, 41, { align: "right" });
    
    // Title & Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Quotation", 14, 60);
    doc.text(`${new Date().toISOString().split('T')[0]}`, 195, 60, { align: "right" });
    
    // Table
    const tableData = buildItems.map(item => {
      const price = item.discount ? item.price : (item.originalPrice || item.price);
      return [
        item.name,
        formatLKR(price).replace('Rs.', '').trim(),
        '1',
        formatLKR(price).replace('Rs.', '').trim()
      ];
    });

    // @ts-ignore
    autoTable(doc, {
      startY: 65,
      head: [['PRODUCT NAME', 'PRICE (Rs.)', 'QTY', 'TOTAL (Rs.)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right' }
      },
      styles: { fontSize: 9, cellPadding: 5, lineColor: [220, 220, 220], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 65;
    
    // Subtotal row
    doc.setFillColor(243, 244, 246);
    doc.rect(14, finalY, 182, 10, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, finalY, 182, 10, 'S');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Subtotal :", 155, finalY + 6.5, { align: "right" });
    doc.text(`${formatLKR(buildTotal).replace('Rs.', '').trim()}`, 190, finalY + 6.5, { align: "right" });
    
    // Total row (Green Theme)
    doc.setFillColor(46, 230, 97); // #2ee661
    doc.rect(14, finalY + 10, 182, 12, 'F');
    doc.rect(14, finalY + 10, 182, 12, 'S');
    doc.setTextColor(0, 0, 0); // Black text on green
    doc.setFontSize(10);
    doc.text("Total (Rs.) :", 155, finalY + 18, { align: "right" });
    doc.text(`${formatLKR(buildTotal).replace('Rs.', '').trim()}`, 190, finalY + 18, { align: "right" });
    
    // Footer Note
    doc.setFontSize(9);
    doc.text("* Note", 14, 260);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("All prices are in Rs", 14, 265);
    doc.text("All prices are subject to change according to product availability.", 14, 270);
    doc.text("Payments must be made to Tulip Computers", 14, 275);
    
    doc.setFont('helvetica', 'italic');
    doc.text("2026 @ Tulip Computers. All Right Reserved.", 195, 275, { align: "right" });
    
    doc.save('PC_Quotation.pdf');
  };

  return (
    <div className="bg-white min-h-screen pb-16 pt-32 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Build My PC</h1>
            <p className="text-gray-500 text-sm">Your budget. Your choice. A PC built with Premium Orion parts.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAI(!showAI)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-2 px-4 rounded-lg transition-colors text-sm border border-blue-200">
              {showAI ? "Hide AI Assistant" : "✨ Use AI Assistant"}
            </button>
            <button onClick={() => setShowSavedBuilds(true)} className="bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold py-2 px-4 rounded-lg transition-colors text-sm border border-gray-200">
              View Saved Builds
            </button>
          </div>
        </div>

        
        {/* AI Assistant Banner */}
        {showAI && (
        <div className="mb-10 bg-[#f4f7fb] rounded-2xl border border-[#e5edf5] p-6 lg:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-sm font-black text-[#00AEEF] uppercase tracking-widest mb-1">TELL US WHAT YOU NEED</h2>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Suggest a build.</h3>
              <p className="text-gray-600 text-sm">Type it or use your voice. We’ll find store parts for your budget.</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-800">Describe your budget, purpose and preferred parts</label>
              <textarea 
                placeholder="For example: Rs. 500,000 for gaming, AMD, 16GB RAM, 512GB storage, no monitor. You can write in Sinhala or English."
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] focus:outline-none focus:border-[#00AEEF] resize-none shadow-sm"
              ></textarea>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button className="bg-[#00AEEF] hover:bg-[#0096ce] text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm shadow-lg shadow-[#00AEEF]/20">
                  Build from
                </button>
                <button className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm shadow-lg shadow-black/10">
                  Start a new build
                </button>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Voice language</span>
                  <select className="bg-transparent font-bold text-gray-900 text-sm outline-none cursor-pointer mt-1">
                    <option>සිංහල</option>
                    <option>English</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors text-sm shadow-sm ml-auto md:ml-0">
                  Start speaking
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium pt-2">Your current selection stays until a new suggestion is ready. Undo brings it back.</p>
          </div>
        </div>
        )}

        {/* Top Filters */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Set up your build.</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Your budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                <input type="text" defaultValue="400000" className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-32 focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Made for</label>
              <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-40 focus:outline-none focus:border-red-500 appearance-none">
                <option>Gaming</option>
                <option>Editing</option>
                <option>Office</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Processor platform</label>
              <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-40 focus:outline-none focus:border-red-500 appearance-none">
                <option>Intel</option>
                <option>AMD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* Left Column: Category Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Your components</h3>
            <div className="flex flex-col relative before:content-[''] before:absolute before:left-6 before:top-4 before:bottom-4 before:w-px before:bg-gray-200">
              {BUILD_CATEGORIES.map(cat => {
                const isActive = activeCategory.id === cat.id;
                const isSelected = buildItems.some(item => cat.keywords.some(kw => item.name.toLowerCase().includes(kw.toLowerCase()) || item.category.toLowerCase().includes(kw.toLowerCase())));
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-4 py-3 px-4 rounded-xl text-left transition-all relative z-10 ${isActive ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 bg-white ${isActive ? 'border-red-500' : isSelected ? 'border-green-500' : 'border-gray-300'}`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {!isActive && isSelected && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                    <cat.icon size={18} className={`${isActive ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Column: Product Selection */}
          <div className="flex-1 min-h-[600px]">
            <h2 className="text-xl font-black mb-1">{activeCategory.name}</h2>
            <p className="text-xs text-gray-500 mb-6">Choose a part to build your PC.</p>
            
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search models, brands or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-b border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            
            <div className="space-y-4">
              {availableProducts.length > 0 ? availableProducts.map(product => {
                const isSelected = buildItems.some(item => item.id === product.id);
                return (
                  <div key={product.id} className={`flex items-center gap-6 p-4 rounded-xl border transition-all ${isSelected ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <div className="w-24 h-24 shrink-0 bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{product.name}</h4>
                      <p className="text-xs text-gray-500 truncate mb-3">{product.category}</p>
                      <span className="font-black text-gray-900">{formatLKR(product.discount ? product.price : (product.originalPrice || product.price))}</span>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? (
                        <button onClick={() => removeFromBuild(product.id)} className="text-red-500 border border-red-200 bg-red-50 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors uppercase tracking-wider">Remove</button>
                      ) : (
                        <button onClick={() => addToBuild(product)} className="text-red-500 border border-red-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors uppercase tracking-wider flex items-center gap-1"><PlusCircle size={14}/> Choose</button>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm">No products found for this category.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Build Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sticky top-36">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900">The build, so far.</h3>
                <button onClick={generatePDF} className="text-gray-400 hover:text-red-500 transition-colors" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>
              
              {/* Fixed 3D PC Animation */}
              <div className="h-40 mb-6 flex items-center justify-center relative" style={{ perspective: '1000px' }}>
                <motion.div 
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-[0_0_20px_rgba(0,174,239,0.2)] relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center overflow-hidden" style={{ transform: 'translateZ(10px)' }}>
                    <div className="w-12 h-12 rounded-full border-[3px] border-dashed border-[#00AEEF] animate-spin absolute top-3 opacity-50"></div>
                    <div className="w-6 h-6 bg-blue-400 blur-xl absolute bottom-3 right-2 animate-pulse"></div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#00AEEF] text-[7px] font-black tracking-widest uppercase" style={{ transform: 'translateZ(11px)' }}>TULIP</div>
                </motion.div>
              </div>

              <div className="min-h-[200px] flex flex-col">
                {buildItems.length > 0 ? (
                  <div className="space-y-4 mb-6 flex-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {buildItems.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 leading-tight mb-1">{item.name}</p>
                          <span className="text-xs font-bold text-gray-500">{formatLKR(item.discount ? item.price : (item.originalPrice || item.price))}</span>
                        </div>
                        <button onClick={() => removeFromBuild(item.id)} className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-8">
                    <Box size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">Good things start with one part.</p>
                    <p className="text-xs mt-1">Choose a component from the left.</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatLKR(buildTotal)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddAllToCart}
                      disabled={buildItems.length === 0}
                      className="flex-1 bg-[#f87171] hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                    >
                      <ShoppingCart size={18} /> Cart
                    </button>
                    <button 
                      onClick={() => {
                        const name = prompt("Enter a name for this build:", "My Custom PC");
                        if (name) {
                          saveBuild(name, buildItems, buildTotal);
                          alert("Build saved successfully!");
                        }
                      }}
                      disabled={buildItems.length === 0}
                      className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save PC Build"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">Delivery and payment methods are calculated at checkout.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {showSavedBuilds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">Saved PC Builds</h3>
              <button onClick={() => setShowSavedBuilds(false)} className="text-gray-400 hover:text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {savedBuilds.length > 0 ? (
                <div className="space-y-4">
                  {savedBuilds.map(build => (
                    <div key={build.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{build.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">Saved on: {build.date} • {build.items.length} items</p>
                        <p className="font-black text-[#2ee661]">{formatLKR(build.total)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            loadBuild(build.id);
                            setShowSavedBuilds(false);
                          }}
                          className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black uppercase"
                        >
                          Load & Edit
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this saved build?")) {
                              deleteSavedBuild(build.id);
                            }
                          }}
                          className="bg-red-50 text-red-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-100 uppercase"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You don't have any saved builds yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
