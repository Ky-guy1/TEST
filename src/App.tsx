import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ConversationalChat } from './components/ConversationalChat';
import { WaterBillTracker } from './components/WaterBillTracker';
import { OutageMap } from './components/OutageMap';
import { TariffCalculator } from './components/TariffCalculator';
import { LeakReportModal } from './components/LeakReportModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Footer } from './components/Footer';
import { WaterBill } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'bills' | 'outages' | 'calculator'>('chat');
  
  // Track selected account for Bill Tracker
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('ACC-849201');
  
  // Track initial chat query when jumping to chat from Bill Tracker
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');

  // Modals
  const [isLeakModalOpen, setIsLeakModalOpen] = useState<boolean>(false);
  const [invoiceBill, setInvoiceBill] = useState<WaterBill | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const handleSearchBillFromHero = (accountNumber: string) => {
    setSelectedAccountNumber(accountNumber);
    setActiveTab('bills');
  };

  const handleAskAIAboutBill = (query: string) => {
    setInitialChatQuery(query);
    setActiveTab('chat');
  };

  const handleOpenInvoiceModal = (bill: WaterBill) => {
    setInvoiceBill(bill);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/25 selection:text-sky-200 relative antialiased bg-grid-subtle">
      
      {/* Ambient Lighting Gradients (Linear/Stripe Organic Depth) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-sky-500/12 via-blue-600/8 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[25%] right-[-10%] w-[450px] h-[450px] bg-teal-500/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <div className="relative z-40">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLeakModal={() => setIsLeakModalOpen(true)}
        />
      </div>

      {/* Compact Status Ticker Banner */}
      <div className="relative z-30">
        <HeroBanner
          onSearchBill={handleSearchBillFromHero}
          onSelectTab={setActiveTab}
          onOpenLeakModal={() => setIsLeakModalOpen(true)}
        />
      </div>

      {/* Main Workspace Dashboard Container */}
      <main className="flex-1 relative z-10 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {activeTab === 'chat' && (
          <ConversationalChat
            onSelectBill={(accNum) => {
              setSelectedAccountNumber(accNum);
              setActiveTab('bills');
            }}
            onOpenLeakModal={() => setIsLeakModalOpen(true)}
            initialQuery={initialChatQuery}
          />
        )}

        {activeTab === 'bills' && (
          <WaterBillTracker
            initialAccountNumber={selectedAccountNumber}
            onAskAIAboutBill={handleAskAIAboutBill}
            onOpenInvoiceModal={handleOpenInvoiceModal}
          />
        )}

        {activeTab === 'outages' && (
          <OutageMap
            onOpenLeakModal={() => setIsLeakModalOpen(true)}
          />
        )}

        {activeTab === 'calculator' && (
          <TariffCalculator />
        )}
      </main>

      {/* Modals */}
      <LeakReportModal
        isOpen={isLeakModalOpen}
        onClose={() => setIsLeakModalOpen(false)}
      />

      <InvoiceModal
        bill={invoiceBill}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      {/* Compact Minimal Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>

    </div>
  );
}
