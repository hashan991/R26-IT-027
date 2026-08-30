import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";


function MonthlyComparisonChart({ data }) {


  if (!data) {
    return null;
  }


  const chartData = [

    {
      name: "Sales Units",

      Previous:
        data.previous_month.sales_units,

      Current:
        data.current_prediction.sales_units,
    },

  ];



  return (

    <div className="comparison-chart-card">


      <h3>
        Previous Month vs Current Prediction
      </h3>


      <p className="comparison-description">

        Compare historical sales performance with
        the AI predicted month.

      </p>



      <ResponsiveContainer
        width="100%"
        height={300}
      >


        <BarChart
          data={chartData}
          margin={{
            top:20,
            right:30,
            left:20,
            bottom:20
          }}
        >


          <CartesianGrid
            strokeDasharray="3 3"
          />


          <XAxis
            dataKey="name"
          />


          <YAxis />


          <Tooltip />


          <Legend />



          <Bar

            dataKey="Previous"

            name={
              `${data.previous_month.month} Sales`
            }

            fill="#b08968"

            radius={[
              8,
              8,
              0,
              0
            ]}

          />



          <Bar

            dataKey="Current"

            name={
              `${data.current_prediction.month} Prediction`
            }

            fill="#3a7d44"

            radius={[
              8,
              8,
              0,
              0
            ]}

          />


        </BarChart>


      </ResponsiveContainer>



      <div className="comparison-summary">


        <strong>

          {data.change.percentage > 0
            ? "+"
            : ""
          }

          {data.change.percentage}%

        </strong>


        <span>

          sales change compared with previous month

        </span>


      </div>



    </div>

  );

}


export default MonthlyComparisonChart;