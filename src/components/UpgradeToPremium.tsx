import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Shield, Smartphone, CreditCard, Sparkles, TrendingUp, Award, MessageCircle } from 'lucide-react';
import { useAppContext } from '../App';
import { motion, AnimatePresence } from 'motion/react';

export default function UpgradeToPremium() {
  const { setShowUpgrade } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<'boost' | 'premium' | 'pro' | 'credits'>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'afrimoney' | 'card'>('orange');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const getPrice = () => {
    switch (selectedPlan) {
      case 'boost': return 20;
      case 'premium': return 50;
      case 'pro': return 150;
      case 'credits': return 75;
    }
  };

  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    console.log(`[Payment Intent] Provider: ${paymentMethod}, Plan: ${selectedPlan}, Amount: ${getPrice()} NLE`);
    
    setTimeout(() => {
      setIsProcessing(false);
      alert('Payment Success! Your account/listing has been upgraded.');
      setShowUpgrade(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 absolute inset-0 z-[100]">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowUpgrade(false)}
                className="w-10 h-10 bg-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-transform"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Growth Hub</h1>
        </div>
        <div className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
           <Sparkles size={14} />
           MVP Mode
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-28">
        
        {/* Tier Cards - horizontally scrolling for selection */}
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Select a Plan</h3>
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
          
          <div className="shrink-0 w-[85vw] max-w-[320px] snap-center">
             <PlanCard 
               title="Boost Listing" 
               icon={<TrendingUp className="text-sky-500" size={24} />}
               price="20" 
               period="7 days"
               description="Push a single listing to #1 in its category to sell or rent faster."
               features={['"URGENT" badge', 'Top of search results', 'High visibility layout']}
               isActive={selectedPlan === 'boost'}
               onClick={() => setSelectedPlan('boost')}
             />
          </div>
          
          <div className="shrink-0 w-[85vw] max-w-[320px] snap-center">
             <PlanCard 
               title="Premium Listing" 
               icon={<Award className="text-purple-500" size={24} />}
               price="50" 
               period="per month"
               description="Upgrade to unlimited listings with featured prominence."
               features={['Unlimited listings', 'Featured badge', 'Priority ranking']}
               isActive={selectedPlan === 'premium'}
               onClick={() => setSelectedPlan('premium')}
             />
          </div>

          <div className="shrink-0 w-[85vw] max-w-[320px] snap-center relative">
            <div className="absolute -top-3 right-4 bg-amber-400 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border-2 border-white z-10">
              Agent Choice
            </div>
            <PlanCard 
              title="Agent Pro" 
              icon={<Shield className="text-amber-500" size={24} />}
              price="150" 
              period="per month"
              description="For agencies and full-time pros. Maximize your reach."
              features={['Verified badge', 'Analytics dashboard', '20+ listings allowed', 'Priority support']}
              isActive={selectedPlan === 'pro'}
              onClick={() => setSelectedPlan('pro')}
              isPro
            />
          </div>
          
          <div className="shrink-0 w-[85vw] max-w-[320px] snap-center">
             <PlanCard 
               title="Lead Credits" 
               icon={<MessageCircle className="text-emerald-500" size={24} />}
               price="75" 
               period="50 leads"
               description="Pay only when you get a WhatsApp lead. Perfect for part-timers."
               features={['No monthly subscription', 'Pay per WhatsApp click', 'No expiration date']}
               isActive={selectedPlan === 'credits'}
               onClick={() => setSelectedPlan('credits')}
             />
          </div>

        </div>

        {/* Payment Methods */}
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 mt-2">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
           <button 
             type="button"
             onClick={() => setPaymentMethod('orange')}
             className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'orange' ? 'border-[#ff7900] bg-[#ff7900]/5' : 'border-slate-200 bg-white'}`}
           >
             <div className="w-8 h-8 rounded-full bg-[#ff7900] flex items-center justify-center text-white">
                <Smartphone size={16} />
             </div>
             <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">Orange<br/>Money</span>
           </button>

           <button 
             type="button"
             onClick={() => setPaymentMethod('afrimoney')}
             className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'afrimoney' ? 'border-[#ec1d24] bg-[#ec1d24]/5' : 'border-slate-200 bg-white'}`}
           >
             <div className="w-8 h-8 rounded-full bg-[#ec1d24] flex items-center justify-center text-white">
                <Smartphone size={16} />
             </div>
             <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">AfriMoney</span>
           </button>

           <button 
             type="button"
             onClick={() => setPaymentMethod('card')}
             className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}
           >
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white">
                <CreditCard size={16} />
             </div>
             <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">Card<br/>(Diaspora)</span>
           </button>
        </div>

        {/* Payment Details Form */}
        <form onSubmit={handleSimulatedPayment} className="space-y-4">
          <AnimatePresence mode="wait">
            {paymentMethod !== 'card' ? (
              <motion.div 
                key="mobile-money"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Mobile Money Number
                  </label>
                  <div className="flex shadow-sm rounded-xl">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 font-bold text-sm">
                      +232
                    </span>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={paymentMethod === 'orange' ? '76 000 000' : '77 000 000'}
                      required
                      className="flex-1 w-full bg-white border border-slate-200 rounded-r-xl px-4 py-3.5 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-slate-500 p-2 bg-slate-50 rounded-lg">
                    <Shield size={14} className="text-green-500 shrink-0" />
                    You will receive a USSD prompt on your phone to confirm the PIN.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="stripe-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                 <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                   <CreditCard size={28} className="text-slate-300" />
                   <p className="text-sm font-medium">Stripe Elements Payment Gateway</p>
                   <p className="text-xs">Accepts Visa, Mastercard, AMEX</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-6 bg-slate-900 disabled:bg-slate-400 text-white font-bold h-14 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Pay NLE ${getPrice()}`
            )}
          </button>
          <p className="text-center text-[10px] font-semibold text-slate-400">
            By paying, you agree to Easyfen's Terms of Service.
            <br/>30-day money-back guarantee for first-time agents.
          </p>
        </form>

      </div>
    </div>
  );
}

function PlanCard({ title, icon, price, period, description, features, isActive, onClick, isPro = false }: { title: string, icon: React.ReactNode, price: string, period: string, description: string, features: string[], isActive: boolean, onClick: () => void, isPro?: boolean }) {
  return (
    <div 
      onClick={onClick}
      className={`h-full border-2 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.98] flex flex-col ${
        isActive 
          ? (isPro ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-sky-500 bg-sky-50 shadow-md')
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
              {icon}
            </div>
            <h3 className={`font-black text-lg ${isPro ? 'text-amber-800' : 'text-slate-800'}`}>{title}</h3>
         </div>
         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? (isPro ? 'border-amber-400 bg-amber-400' : 'border-sky-500 bg-sky-500') : 'border-slate-300 bg-transparent'}`}>
            {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
         </div>
      </div>
      
      <p className="text-xs font-semibold text-slate-500 mt-2 mb-4 h-8">{description}</p>
      
      <div className="mb-5 pb-4 border-b border-black/5">
        <span className={`text-3xl font-black ${isPro ? 'text-amber-700' : 'text-slate-900'}`}>NLE {price}</span>
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider ml-1">/ {period}</span>
      </div>

      <div className="space-y-3 mt-auto">
         {features.map((feat, i) => (
           <div key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium leading-tight">
             <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isPro ? 'text-amber-500' : 'text-sky-500'}`} />
             <span>{feat}</span>
           </div>
         ))}
      </div>
    </div>
  );
}

