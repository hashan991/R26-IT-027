import api from "../../../shared/services/api";


export const predictSales = async ({ year, month }) => {
  const response = await api.post("/api/sales/predict", {
    year: Number(year),
    month: Number(month),
  });
  return response.data;
};


export const saveSalesEntry = async ({ year, month, salesCount }) => {
  const response = await api.post("/api/sales/entries", {
    year: Number(year),
    month: Number(month),
    sales_count: Number(salesCount),
  });
  return response.data;
};


export const updateSalesEntry = async ({ year, month, salesCount }) => {
  const response = await api.put(
    `/api/sales/entries/${Number(year)}/${Number(month)}`,
    {
      sales_count: Number(salesCount),
    }
  );
  return response.data;
};


export const deleteSalesEntry = async ({ year, month }) => {
  const response = await api.delete(
    `/api/sales/entries/${Number(year)}/${Number(month)}`
  );
  return response.data;
};


export const getSalesEntries = async () => {
  const response = await api.get("/api/sales/entries");
  return response.data?.entries || [];
};


export const getPreviousSalesEntry = async () => {
  try {
    const response = await api.get("/api/sales/entries/previous");
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};


export const getCurrentMonthWeather = async () => {
  const response = await api.get("/api/sales/weather/current-month");
  return response.data;
};


export const generateYearForecast = async ({ startYear, startMonth }) => {
  const response = await api.post("/api/sales/forecast/year", {
    start_year: Number(startYear),
    start_month: Number(startMonth),
  });
  return response.data;
};
