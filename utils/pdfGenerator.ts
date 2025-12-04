import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { TaxiEntry, SummaryStats } from '../types';

const fmt = (num: number = 0) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const generatePDFReport = (entries: TaxiEntry[], stats: SummaryStats, dateRangeStr: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  //
  // ===== Modern White Header =====
  //
  doc.setFontSize(22);
  doc.setTextColor(25, 25, 25);
  doc.text("Trusty Yellow Cabs", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(90, 90, 90);
  doc.text("Monthly Statement", pageWidth / 2, 26, { align: "center" });

  // Soft divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(18, 32, pageWidth - 18, 32);

  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 18, 39);

  //
  // ===== Summary Section =====
  //
  let yPos = 53;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Summary (${dateRangeStr})`, 18, yPos);

  const summaryData = [
    ["Total Income", `+ Rs. ${fmt(stats.totalIncome)}`],
    ["Total Expenses", `- Rs. ${fmt(stats.totalExpense)}`],
    ["Driver Salaries", `Rs. ${fmt(stats.totalSalary)}`],
    ["Net Profit", `Rs. ${fmt(stats.totalProfit)}`],
  ];

  autoTable(doc, {
    startY: yPos + 6,
    head: [["Category", "Amount"]],
    body: summaryData,
    theme: "grid",
    styles: {
      fontSize: 11,
      textColor: [40, 40, 40],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      lineColor: [230, 230, 230],
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [0, 150, 0];
      }
    },
  });

  //
  // ===== Detailed Entries Section =====
  //
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 18;

  if (yPos > doc.internal.pageSize.height - 40) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Detailed Entries", 18, yPos);

  const tableData = entries.map(e => {
    const expenses =
      (e.fuel_expense ?? 0) +
      (e.maintenance_expense ?? 0) +
      (e.other_expense ?? 0) +
      (e.driver_salary ?? 0);

    const profit = (e.income_amount ?? 0) - expenses;

    return [
      format(new Date(e.date), "dd-MMM-yyyy"),
      e.vehicle_number,
      e.driver_name,
      fmt(e.income_amount),
      fmt(expenses),
      fmt(profit),
    ];
  });

  autoTable(doc, {
    startY: yPos + 6,
    head: [["Date", "Vehicle", "Driver", "Income", "Expense", "Profit"]],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 9.5,
      textColor: [40, 40, 40],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [40, 40, 40],
      fontStyle: "bold",
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold", textColor: [0, 140, 0] },
    },
  });

  //
  // Save File
  //
  doc.save(`taxi_report_${format(new Date(), "yyyyMMdd")}.pdf`);
};
