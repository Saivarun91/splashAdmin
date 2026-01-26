import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

const Invoice = () => {
  const invoiceRef = useRef();

  const data = {
    invoiceNo: "67890",
    date: "20/03/2025",
    client: {
      name: "Olivia Wilson",
      address: "123 Anywhere St., Any City",
      phone: "+123-456-7890",
    },
    items: [{ name: "Plan Name", qty: 1, price: 150 }],
    gstPercent: 18,
    gstAmount: 25,
    total: 175,
    bank: {
      name: "Borcelle Bank",
      accountName: "Studio Shodwe",
      accountNo: "123-456-7890",
    },
    payBy: "10/08/2025",
  };

  const downloadPDF = () => {
    const opt = {
      margin: 0,
      filename: `Invoice_${data.invoiceNo}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(invoiceRef.current).set(opt).save();
  };

  return (
    <div>
      {/* BUTTON */}
      <div style={styles.buttonBar}>
        <button style={styles.button} onClick={downloadPDF}>
          Download PDF
        </button>
        <button style={styles.button} onClick={() => window.print()}>
          Print Invoice
        </button>
      </div>

      {/* INVOICE */}
      <div ref={invoiceRef} style={styles.page}>
        <div style={styles.header}>
          <div>
            <div style={styles.logo}>Splash</div>
            <div style={styles.subLogo}>AI STUDIO</div>
          </div>

          <div style={styles.invoiceTitle}>
            <h1 style={styles.invoiceText}>INVOICE</h1>
            <p><strong>Invoice #</strong> {data.invoiceNo}</p>
            <p><strong>Date:</strong> {data.date}</p>
          </div>
        </div>

        <div style={styles.purpleLine}></div>

        <div style={styles.billing}>
          <h4>Billed to:</h4>
          <p>{data.client.name}</p>
          <p>{data.client.address}</p>
          <p>{data.client.phone}</p>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.qty}</td>
                <td style={styles.td}>${item.price}</td>
                <td style={styles.td}>${item.qty * item.price}</td>
              </tr>
            ))}
            <tr>
              <td style={styles.td}>Gst</td>
              <td style={styles.td}>{data.gstPercent}%</td>
              <td style={styles.td}>${data.gstAmount}</td>
              <td style={styles.td}>${data.gstAmount}</td>
            </tr>
          </tbody>
        </table>

        <div style={styles.totalBox}>
          <span>Total</span>
          <span>${data.total}</span>
        </div>

        <div style={styles.footer}>
          <p style={styles.thanks}>Thank you for your business</p>

          <div style={styles.section}>
            <h4>Payment Information</h4>
            <p>{data.bank.name}</p>
            <p>Account Name: {data.bank.accountName}</p>
            <p>Account No.: {data.bank.accountNo}</p>
            <p>Pay by: {data.payBy}</p>
          </div>

          <div style={styles.section}>
            <h4>Terms and conditions</h4>
            <p>Late payments may result in a 2% penalty fee.</p>
          </div>

          <p style={styles.brand}>Splash AI Studio</p>
        </div>
      </div>
    </div>
  );
};

/* ===================== STYLES ===================== */

const styles = {
  page: {
    width: "210mm",
    height: "297mm",
    padding: "20mm",
    background: "#fff",
    fontFamily: "Arial, sans-serif",
    color: "#000",
  },

  buttonBar: {
    textAlign: "center",
    marginBottom: "20px",
  },

  button: {
    padding: "10px 18px",
    margin: "0 10px",
    background: "#8f6ae1",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: "36px",
    fontWeight: "700",
  },

  subLogo: {
    letterSpacing: "3px",
    fontSize: "14px",
  },

  invoiceTitle: {
    textAlign: "right",
  },

  invoiceText: {
    fontSize: "42px",
    margin: 0,
  },

  purpleLine: {
    height: "10px",
    background: "#8f6ae1",
    margin: "20px 0",
  },

  billing: {
    marginBottom: "25px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#8f6ae1",
    color: "#fff",
    padding: "10px",
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },

  totalBox: {
    marginTop: "20px",
    background: "#8f6ae1",
    color: "#fff",
    width: "260px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginLeft: "auto",
  },

  footer: {
    marginTop: "80px",
    textAlign: "right",
  },

  thanks: {
    fontWeight: "bold",
    marginBottom: "30px",
  },

  section: {
    marginBottom: "20px",
  },

  brand: {
    marginTop: "40px",
    fontSize: "14px",
    opacity: 0.7,
  },
};

export default Invoice;
