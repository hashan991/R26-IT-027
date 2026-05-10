import api from "../../../shared/services/api";

export const predictSales = async ({ year, month }) => {
  const response = await api.post("/api/sales/predict", {
    year: Number(year),
    month: Number(month),
  });

  return response.data;
};
