import { WaterBill, OutageNotice } from '../types';

export const MOCK_BILLS: WaterBill[] = [
  {
    accountNumber: 'ACC-849201',
    customerName: 'Marcus Antoine',
    serviceAddress: '14 Flamboyant Drive, Grand Anse',
    parish: 'St. George',
    meterNumber: 'MTR-77291-GND',
    billingPeriod: 'June 1 - June 30, 2026',
    dueDate: '2026-08-15',
    currentBalance: 184.50,
    previousBalance: 0.00,
    consumptionGallons: 4250,
    consumptionM3: 16.1,
    serviceType: 'Domestic',
    status: 'Unpaid',
    usageHistory: [
      { month: 'Jan', gallons: 3800, amount: 162.00 },
      { month: 'Feb', gallons: 3950, amount: 168.00 },
      { month: 'Mar', gallons: 4100, amount: 175.50 },
      { month: 'Apr', gallons: 4050, amount: 173.00 },
      { month: 'May', gallons: 4300, amount: 188.00 },
      { month: 'Jun', gallons: 4250, amount: 184.50 },
    ],
    lastPaymentDate: '2026-06-12',
    lastPaymentAmount: 188.00,
  },
  {
    accountNumber: 'ACC-102938',
    customerName: 'Spice Isle Resort & Villas',
    serviceAddress: 'Main Coastal Highway, St. George\'s',
    parish: 'St. George',
    meterNumber: 'MTR-90041-COM',
    billingPeriod: 'June 1 - June 30, 2026',
    dueDate: '2026-08-10',
    currentBalance: 1420.75,
    previousBalance: 250.00,
    consumptionGallons: 32000,
    consumptionM3: 121.1,
    serviceType: 'Commercial',
    status: 'Overdue',
    usageHistory: [
      { month: 'Jan', gallons: 28000, amount: 1250.00 },
      { month: 'Feb', gallons: 30000, amount: 1340.00 },
      { month: 'Mar', gallons: 35000, amount: 1560.00 },
      { month: 'Apr', gallons: 34000, amount: 1510.00 },
      { month: 'May', gallons: 31000, amount: 1380.00 },
      { month: 'Jun', gallons: 32000, amount: 1420.75 },
    ],
    lastPaymentDate: '2026-05-20',
    lastPaymentAmount: 1380.00,
  },
  {
    accountNumber: 'ACC-554192',
    customerName: 'Devon & Althea Mitchell',
    serviceAddress: 'Victoria Main Street, St. Mark',
    parish: 'St. Mark',
    meterNumber: 'MTR-33812-STM',
    billingPeriod: 'June 1 - June 30, 2026',
    dueDate: '2026-08-20',
    currentBalance: 92.00,
    previousBalance: 0.00,
    consumptionGallons: 2400,
    consumptionM3: 9.1,
    serviceType: 'Domestic',
    status: 'Unpaid',
    usageHistory: [
      { month: 'Jan', gallons: 2200, amount: 85.00 },
      { month: 'Feb', gallons: 2300, amount: 88.00 },
      { month: 'Mar', gallons: 2500, amount: 96.00 },
      { month: 'Apr', gallons: 2450, amount: 94.00 },
      { month: 'May', gallons: 2600, amount: 101.00 },
      { month: 'Jun', gallons: 2400, amount: 92.00 },
    ],
    lastPaymentDate: '2026-06-18',
    lastPaymentAmount: 101.00,
  },
  {
    accountNumber: 'ACC-391048',
    customerName: 'Clarice Carriacou Marine',
    serviceAddress: 'Hillsborough Bay Front, Carriacou',
    parish: 'Carriacou & Petite Martinique',
    meterNumber: 'MTR-11920-CRR',
    billingPeriod: 'June 1 - June 30, 2026',
    dueDate: '2026-08-05',
    currentBalance: 0.00,
    previousBalance: 0.00,
    consumptionGallons: 18500,
    consumptionM3: 70.0,
    serviceType: 'Commercial',
    status: 'Paid',
    usageHistory: [
      { month: 'Jan', gallons: 16000, amount: 720.00 },
      { month: 'Feb', gallons: 17500, amount: 790.00 },
      { month: 'Mar', gallons: 19000, amount: 850.00 },
      { month: 'Apr', gallons: 18000, amount: 810.00 },
      { month: 'May', gallons: 18200, amount: 820.00 },
      { month: 'Jun', gallons: 18500, amount: 835.00 },
    ],
    lastPaymentDate: '2026-07-02',
    lastPaymentAmount: 835.00,
  }
];

export const MOCK_OUTAGES: OutageNotice[] = [
  {
    id: 'OUT-2026-01',
    parish: 'St. George',
    area: 'Grand Anse, Morne Rouge & Mont Rouge Reservoir',
    reason: 'Scheduled pipe line upgrade & valve maintenance at Les Avocat Plant',
    status: 'Active Maintenance',
    affectedCustomers: 1250,
    estimatedRestoration: 'Today, 4:30 PM AST',
    severity: 'moderate',
  },
  {
    id: 'OUT-2026-02',
    parish: 'St. Andrew',
    area: 'Grenville Town Center & Canal Road',
    reason: 'Emergency main burst repair near Mirabeau Treatment Facility',
    status: 'Emergency Outage',
    affectedCustomers: 3400,
    estimatedRestoration: 'Today, 7:00 PM AST',
    severity: 'high',
  },
  {
    id: 'OUT-2026-03',
    parish: 'St. John',
    area: 'Gouyave Estate & Lower Depradine',
    reason: 'Routine filter backwashing & pressure optimization',
    status: 'Scheduled',
    affectedCustomers: 620,
    estimatedRestoration: 'Tomorrow, 11:00 AM AST',
    severity: 'low',
  },
  {
    id: 'OUT-2026-04',
    parish: 'Carriacou',
    area: 'Hillsborough High Level & Belair',
    reason: 'Desalination plant pump servicing',
    status: 'Restored',
    affectedCustomers: 0,
    estimatedRestoration: 'Fully Restored',
    severity: 'low',
  }
];

export const GRENADA_PARISHES = [
  "St. George",
  "St. Andrew",
  "St. David",
  "St. Patrick",
  "St. John",
  "St. Mark",
  "Carriacou & Petite Martinique"
];

/**
 * Generate a dynamic realistic water bill if requested account number is not in static mock
 */
export function getOrCreateBill(query: string): WaterBill {
  const cleanQuery = query.trim().toUpperCase();
  const existing = MOCK_BILLS.find(
    b => b.accountNumber.toUpperCase() === cleanQuery || 
         b.customerName.toUpperCase().includes(cleanQuery) ||
         cleanQuery.includes(b.accountNumber.toUpperCase())
  );
  if (existing) return existing;

  // Generate dynamic bill
  const hash = cleanQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gallons = 2000 + (hash % 6000);
  const baseRate = 0.042; // per gallon approx XCD
  const rawBalance = Math.round((gallons * baseRate + 35) * 100) / 100;
  
  const accNum = cleanQuery.startsWith('ACC-') ? cleanQuery : `ACC-${(hash * 31) % 899999 + 100000}`;

  return {
    accountNumber: accNum,
    customerName: query.length > 3 && !query.startsWith('ACC-') ? query : 'Valued Grenadian Customer',
    serviceAddress: 'St. George\'s, Grenada',
    parish: 'St. George',
    meterNumber: `MTR-${hash % 90000 + 10000}-GND`,
    billingPeriod: 'June 1 - June 30, 2026',
    dueDate: '2026-08-18',
    currentBalance: rawBalance,
    previousBalance: 0,
    consumptionGallons: gallons,
    consumptionM3: Math.round((gallons * 0.00378541) * 10) / 10,
    serviceType: 'Domestic',
    status: 'Unpaid',
    usageHistory: [
      { month: 'Jan', gallons: Math.round(gallons * 0.9), amount: Math.round(rawBalance * 0.9) },
      { month: 'Feb', gallons: Math.round(gallons * 0.95), amount: Math.round(rawBalance * 0.95) },
      { month: 'Mar', gallons: Math.round(gallons * 1.05), amount: Math.round(rawBalance * 1.05) },
      { month: 'Apr', gallons: Math.round(gallons * 0.98), amount: Math.round(rawBalance * 0.98) },
      { month: 'May', gallons: Math.round(gallons * 1.02), amount: Math.round(rawBalance * 1.02) },
      { month: 'Jun', gallons: gallons, amount: rawBalance },
    ],
    lastPaymentDate: '2026-06-15',
    lastPaymentAmount: rawBalance,
  };
}
