import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MOCK_BILLS, MOCK_OUTAGES, getOrCreateBill } from "./src/data/mockData.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI Client lazily/safely
let defaultAiClient: GoogleGenAI | null = null;
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "";
  if (customApiKey) {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  if (!defaultAiClient) {
    defaultAiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return defaultAiClient;
}

// System instruction for NAWASA Customer Support
const NAWASA_SYSTEM_INSTRUCTION = `
You are the official Customer Support Representative for NAWASA Grenada (National Water and Sewerage Authority of Grenada, Carriacou, and Petite Martinique).
Your duty is to provide clear, courteous, and accurate customer service to residents, property owners, businesses, and applicants across Grenada.

Areas of Support:
1. Account inquiries, billing breakdowns, payment methods, and due date verifications.
2. Reporting leaks, burst mains, low water pressure, and emergency dispatches in any Grenadian parish (St. George, St. Andrew, St. David, St. Patrick, St. John, St. Mark, Carriacou, and Petite Martinique).
3. Live outage notifications, scheduled reservoir maintenance, and water truck deliveries.
4. Water conservation guidance, dry-season rainwater management, and storage best practices.
5. Service connection applications, meter reading verification, tariff classes, and office locations (Headquarters: The Carenage, St. George's; Customer Hotlines: 276 / (473) 440-2155).

Tone and Style:
- Warm, polite, and professional Caribbean customer support representative.
- Avoid robotic or sci-fi clichés. Speak naturally and clearly.
- Format responses cleanly with bold key points and concise bullet items.
- If the customer mentions an account number (e.g. ACC-849201, ACC-102938), provide the specific balance and due date details, and guide them to use the payment options or invoice downloader on the portal.
- Always quote utility rates and monetary amounts in Eastern Caribbean Dollars (EC$ / XCD).
`;

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "NAWASA Grenada Water Portal", timestamp: new Date().toISOString() });
});

// Outages list
app.get("/api/outages", (_req, res) => {
  res.json({ success: true, outages: MOCK_OUTAGES });
});

// Bill Lookup endpoint
app.get("/api/bill/lookup", (req, res) => {
  const query = (req.query.accountNumber || req.query.query || '').toString();
  if (!query) {
    return res.status(400).json({ success: false, error: "Account number or search query is required." });
  }
  const bill = getOrCreateBill(query);
  return res.json({ success: true, bill });
});

app.post("/api/bill/lookup", (req, res) => {
  const { accountNumber } = req.body;
  if (!accountNumber) {
    return res.status(400).json({ success: false, error: "Account number is required." });
  }
  const bill = getOrCreateBill(accountNumber);
  return res.json({ success: true, bill });
});

// Bill Payment endpoint (simulates instant payment)
app.post("/api/bill/pay", (req, res) => {
  const { accountNumber, amountPaid, paymentMethod } = req.body;
  if (!accountNumber) {
    return res.status(400).json({ success: false, error: "Account number is required." });
  }
  const bill = getOrCreateBill(accountNumber);
  const paid = Number(amountPaid) || bill.currentBalance;
  
  // Update bill status locally
  bill.currentBalance = Math.max(0, Math.round((bill.currentBalance - paid) * 100) / 100);
  bill.status = bill.currentBalance === 0 ? 'Paid' : 'Partially Paid';
  bill.lastPaymentDate = new Date().toISOString().split('T')[0];
  bill.lastPaymentAmount = paid;

  const receipt = {
    receiptId: `REC-NAW-${Math.floor(100000 + Math.random() * 900000)}`,
    accountNumber: bill.accountNumber,
    customerName: bill.customerName,
    amountPaid: paid,
    remainingBalance: bill.currentBalance,
    paymentMethod: paymentMethod || 'Online Grenada Banking Direct',
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Grenada' }),
    status: 'SUCCESS'
  };

  return res.json({ success: true, message: "Payment processed successfully.", receipt, bill });
});

// Leak Reporting endpoint
app.post("/api/leak/report", (req, res) => {
  const { location, parish, severity, description, contactName, contactPhone } = req.body;
  if (!location || !description) {
    return res.status(400).json({ success: false, error: "Location and description are required." });
  }

  const ticketId = `NW-LEAK-${Math.floor(10000 + Math.random() * 90000)}`;
  const leakReport = {
    ticketId,
    location,
    parish: parish || "St. George",
    severity: severity || "Medium",
    status: "Dispatched",
    reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description,
    reporterContact: contactPhone || contactName || "Anonymous Resident"
  };

  return res.json({
    success: true,
    message: `Leak report submitted successfully for ${location}, ${parish || "Grenada"}. Dispatch ticket generated.`,
    ticket: leakReport
  });
});

// Gemini Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, persona, territory, simpleLanguage, customApiKey } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const ai = getGeminiClient(customApiKey);

    // Context additions based on user settings
    const personaContext = persona ? `\n[Customer Persona: '${persona}'. Tailor response appropriately.]` : '';
    const territoryContext = territory ? `\n[Parish / Island Territory: '${territory}', Grenada.]` : '';
    const simpleContext = simpleLanguage ? `\n[Guidance Style: Provide concise, unhurried, step-by-step instructions.]` : '';

    // Check if account number mentioned in message to auto-fetch context
    const accMatch = message.match(/ACC-\d{6}/i);
    let billContext = "";
    if (accMatch) {
      const foundBill = getOrCreateBill(accMatch[0].toUpperCase());
      billContext = `\n[Account Record: Number: ${foundBill.accountNumber}, Customer: ${foundBill.customerName}, Address: ${foundBill.serviceAddress}, Balance: EC$ ${foundBill.currentBalance.toFixed(2)}, Due: ${foundBill.dueDate}, Status: ${foundBill.status}, Consumption: ${foundBill.consumptionGallons} Gallons]`;
    }

    const fullPrompt = `${NAWASA_SYSTEM_INSTRUCTION} ${personaContext} ${territoryContext} ${simpleContext} ${billContext}\n\nCustomer Inquiry: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const replyText = response.text || "Welcome to NAWASA Customer Support. How can I assist you with your water services today?";

    return res.json({
      success: true,
      reply: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return res.json({
      success: true,
      reply: "Welcome to the NAWASA Customer Support Desk. You can look up your water account using your account number (e.g. **ACC-849201**), pay online, or report a water leak in your parish right here on the portal.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
});

// Vite middleware for development & static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NAWASA Grenada Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
