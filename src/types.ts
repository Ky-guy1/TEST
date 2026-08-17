export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  billData?: WaterBill;
  leakData?: LeakReport;
  actionType?: 'bill_lookup' | 'leak_report' | 'outage_check' | 'tariff_calc';
  attachments?: {
    name: string;
    type: 'camera' | 'photos' | 'drive' | 'files';
    previewUrl?: string;
  }[];
}

export interface WaterBill {
  accountNumber: string;
  customerName: string;
  serviceAddress: string;
  parish: string;
  meterNumber: string;
  billingPeriod: string;
  dueDate: string;
  currentBalance: number;
  previousBalance: number;
  consumptionGallons: number;
  consumptionM3: number;
  serviceType: 'Domestic' | 'Commercial' | 'Governmental';
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Partially Paid';
  usageHistory: {
    month: string;
    gallons: number;
    amount: number;
  }[];
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface LeakReport {
  ticketId: string;
  location: string;
  parish: string;
  severity: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Submitted' | 'Dispatched' | 'In Progress' | 'Resolved';
  reportedAt: string;
  description: string;
  reporterContact?: string;
}

export interface OutageNotice {
  id: string;
  parish: string;
  area: string;
  reason: string;
  status: 'Active Maintenance' | 'Emergency Outage' | 'Restored' | 'Scheduled';
  affectedCustomers: number;
  estimatedRestoration: string;
  severity: 'low' | 'moderate' | 'high';
}

export interface TariffCalcInput {
  category: 'Domestic' | 'Commercial';
  gallons: number;
}

export interface LeakFormState {
  location: string;
  parish: string;
  severity: 'Low' | 'Medium' | 'High' | 'Emergency';
  description: string;
  contactName: string;
  contactPhone: string;
}
