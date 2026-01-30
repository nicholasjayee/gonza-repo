import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportStockSummaryToPDF = (data: any[], dateRange: { from?: Date; to?: Date } | null) => {
  const doc = new jsPDF();

  const title = 'Stock Summary Report';
  const dateStr = dateRange 
    ? `${dateRange.from ? format(dateRange.from, 'PPP') : 'Start'} - ${dateRange.to ? format(dateRange.to, 'PPP') : 'End'}`
    : 'All Time';

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(dateStr, 14, 30);

  const tableColumn = ["Product", "Category", "Stock", "Cost Value", "Sales Value"];
  const tableRows: any[] = [];

  data.forEach(item => {
    const row = [
      item.name,
      item.category,
      item.stock,
      item.costValue,
      item.salesValue
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
  });

  doc.save(`stock_summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
