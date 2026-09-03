import MaintenanceBill from '../models/MaintenanceBill';
import Expense from '../models/Expense';
import SinkingFund from '../models/SinkingFund';
import Society from '../models/Society';
import logger from '../utils/logger';

// --- TALLY XML GENERATION ---
export const generateTallyXML = async (societyId: string) => {
  const society = await Society.findById(societyId);
  const bills = await MaintenanceBill.find({ societyId }).populate('userId', 'name flatNumber wing');
  const expenses = await Expense.find({ societyId });

  const societyName = society ? society.name : 'Housing Society';

  let vouchersXML = '';

  // 1. Sales/Receipt Vouchers for Maintenance Bills
  bills.forEach((bill, index) => {
    const billDate = new Date(bill.createdAt).toISOString().split('T')[0].replace(/-/g, '');
    const residentName = (bill.userId as any)?.name || 'Resident';

    vouchersXML += `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="Sales" ACTION="Create">
        <DATE>${billDate}</DATE>
        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
        <VOUCHERNUMBER>INV-${bill.title.replace(/\s+/g, '-')}-${index + 1}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${residentName}</PARTYLEDGERNAME>
        <NARRATION>Maintenance Bill: ${bill.title}</NARRATION>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${residentName}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${bill.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Society Maintenance Income</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${bill.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
      </VOUCHER>
    </TALLYMESSAGE>`;
  });

  // 2. Payment Vouchers for Expenses
  expenses.forEach((exp, index) => {
    const expDate = new Date(exp.expenseDate || exp.createdAt).toISOString().split('T')[0].replace(/-/g, '');
    vouchersXML += `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="Payment" ACTION="Create">
        <DATE>${expDate}</DATE>
        <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
        <VOUCHERNUMBER>EXP-${index + 1}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>Bank Account</PARTYLEDGERNAME>
        <NARRATION>${exp.title}: ${exp.notes || ''}</NARRATION>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${exp.category || 'Maintenance'}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${exp.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Bank Account</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${exp.amount}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
      </VOUCHER>
    </TALLYMESSAGE>`;
  });

  const fullXML = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${societyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${vouchersXML}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return fullXML;
};

// --- GENERAL LEDGER CSV GENERATION ---
export const generateAccountingCSV = async (societyId: string) => {
  const bills = await MaintenanceBill.find({ societyId }).populate('userId', 'name flatNumber wing');
  const expenses = await Expense.find({ societyId });

  let csv = 'Date,Voucher Type,Voucher No,Account Head,Debit (INR),Credit (INR),Narration\n';

  bills.forEach((bill, idx) => {
    const d = new Date(bill.createdAt).toISOString().split('T')[0];
    const res = (bill.userId as any)?.name || 'Resident';
    // Debit Resident Account
    csv += `"${d}","Sales","BILL-${idx + 1}","${res}",${bill.amount},0,"${bill.title}"\n`;
    // Credit Revenue
    csv += `"${d}","Sales","BILL-${idx + 1}","Maintenance Income",0,${bill.amount},"${bill.title}"\n`;
  });

  expenses.forEach((exp, idx) => {
    const d = new Date(exp.expenseDate || exp.createdAt).toISOString().split('T')[0];
    csv += `"${d}","Payment","EXP-${idx + 1}","${exp.category || 'Maintenance'}",${exp.amount},0,"${exp.title}"\n`;
    csv += `"${d}","Payment","EXP-${idx + 1}","Bank Account",0,${exp.amount},"${exp.title}"\n`;
  });

  return csv;
};

// --- TAX / GST / TDS SUMMARY ---
export const getTaxSummary = async (societyId: string) => {
  const bills = await MaintenanceBill.find({ societyId });
  const expenses = await Expense.find({ societyId });

  const totalBilled = bills.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Standard Indian Housing Society GST rule: 18% GST applies if monthly billing per member exceeds ₹7,500
  const gstCollected = Math.round(totalBilled * 0.18);
  const gstInputCreditPaid = Math.round(totalExpense * 0.18);
  const netGstPayable = Math.max(0, gstCollected - gstInputCreditPaid);
  const estimatedTdsWithheld = Math.round(totalExpense * 0.02); // 2% TDS on contractor payments (Section 194C)

  return {
    totalRevenue: totalBilled,
    totalExpenditure: totalExpense,
    gstOutputCollected: gstCollected,
    gstInputCreditAvailable: gstInputCreditPaid,
    netGstPayable,
    estimatedTdsWithheld
  };
};

// --- SINKING FUND & FD RESERVES ---
export const createSinkingFund = async (data: any, user: any) => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('NOT_AUTHORIZED');
  }

  const { bankName, fdNumber, principalAmount, interestRate, tenureMonths, startDate, purpose, notes } = data;
  const p = Number(principalAmount);
  const r = Number(interestRate) / 100;
  const t = Number(tenureMonths) / 12;

  // Simple quarterly compounded FD maturity calculation
  const maturityAmount = Math.round(p * Math.pow(1 + r / 4, 4 * t));
  const sDate = new Date(startDate);
  const mDate = new Date(sDate);
  mDate.setMonth(mDate.getMonth() + Number(tenureMonths));

  const fund = new SinkingFund({
    societyId: user.societyId,
    bankName,
    fdNumber,
    principalAmount: p,
    interestRate: Number(interestRate),
    tenureMonths: Number(tenureMonths),
    startDate: sDate,
    maturityDate: mDate,
    maturityAmount,
    purpose: purpose || 'General Reserve',
    status: 'Active',
    notes
  });

  await fund.save();
  return fund;
};

export const getSinkingFunds = async (societyId: string) => {
  const funds = await SinkingFund.find({ societyId }).sort({ maturityDate: 1 });
  const totalPrincipal = funds.reduce((sum, f) => sum + (f.principalAmount || 0), 0);
  const totalExpectedMaturity = funds.reduce((sum, f) => sum + (f.maturityAmount || 0), 0);

  // Check funds maturing in next 90 days
  const in90Days = new Date();
  in90Days.setDate(in90Days.getDate() + 90);
  const upcomingMaturities = funds.filter(f => f.status === 'Active' && new Date(f.maturityDate) <= in90Days);

  return {
    funds,
    totalPrincipal,
    totalExpectedMaturity,
    accruedGain: totalExpectedMaturity - totalPrincipal,
    upcomingMaturityCount: upcomingMaturities.length
  };
};
