import api from "../../../shared/services/api";


export const downloadSalesReport = async (year, month) => {

  const response = await api.get(
    "/api/sales/report",
    {
      params: {
        year,
        month
      },
      responseType: "blob"
    }
  );


  const blob = new Blob(
    [response.data],
    {
      type: "application/pdf"
    }
  );


  const url = window.URL.createObjectURL(blob);


  const link = document.createElement("a");

  link.href = url;


  link.download =
    `coffee_sales_report_${year}_${month}.pdf`;


  document.body.appendChild(link);


  link.click();


  link.remove();


  window.URL.revokeObjectURL(url);

};