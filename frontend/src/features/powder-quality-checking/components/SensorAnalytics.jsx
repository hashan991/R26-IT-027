import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";


import {
  Thermometer,
  Droplets,
  Waves,
  Activity,
  Database,
  Clock
} from "lucide-react";


import {
  motion
} from "framer-motion";


import {
  useEffect,
  useState
} from "react";


import apiClient from "../api/apiClient";





function SensorAnalytics(){



const [sensorData,setSensorData] = useState([]);

const [loading,setLoading] = useState(true);

const [error,setError] = useState("");

const [lastUpdate,setLastUpdate] = useState(null);






// =====================================================
// FETCH REAL-TIME SENSOR HISTORY
// =====================================================


const fetchSensorData = async()=>{


try{


const response = await apiClient.get(
"/sensor/history"
);




const records = response.data?.data || [];





const formattedData = records

.slice(-30)

.map((item)=>({



time:

new Date(item.time)

.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit",

second:"2-digit"

}),




temperature:

Number(item.temperature) || 0,




humidity:

Number(item.humidity) || 0,




moisture:

Number(item.moisture) || 0



}));







setSensorData(formattedData);



setLastUpdate(
new Date()
);



setError("");



}


catch(err){


console.error(
"Sensor Analytics Error:",
err
);



setError(
"Sensor analytics connection lost"
);



}



finally{


setLoading(false);


}



};









// =====================================================
// AUTO LIVE UPDATE
// =====================================================


useEffect(()=>{


fetchSensorData();




const interval = setInterval(()=>{


fetchSensorData();



},60000);




return()=>{


clearInterval(interval);



};



},[]);









const chartCard = `

bg-white/5
backdrop-blur-xl
border
border-white/10
rounded-3xl
p-6
shadow-2xl

`;









if(loading){


return(

<div

className="
mt-12
text-center
text-gray-400
animate-pulse
"

>


<Activity

className="
mx-auto
mb-3
text-green-400
"

/>


Loading live sensor analytics...


</div>


)


}









if(error && sensorData.length===0){


return(

<div

className="
mt-12
text-center
text-red-400
"

>


{error}


</div>


)


}










return(


<section

className="
mt-12
w-full
"

>









{/* HEADER */}


<motion.div


initial={{

opacity:0,

y:-20

}}


animate={{

opacity:1,

y:0

}}


className="
mb-8
"

>



<div

className="
flex
justify-between
items-center
"

>


<h2

className="
text-3xl
font-bold
bg-gradient-to-r
from-yellow-400
via-orange-400
to-purple-500
text-transparent
bg-clip-text
"

>


AI Sensor Analytics


</h2>






<div

className="
flex
items-center
gap-4
"

>





<div

className="
flex
items-center
gap-2
px-4
py-2
rounded-full
bg-green-500/10
border
border-green-500/20
"

>


<span

className="
w-2
h-2
rounded-full
bg-green-400
animate-pulse
"

>

</span>



<span

className="
text-sm
text-green-400
font-semibold
"

>


LIVE STREAM


</span>



</div>





</div>



</div>







<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-4
mt-6
"

>





<div

className="
bg-white/5
border
border-white/10
rounded-2xl
p-4
"

>


<div

className="
flex
items-center
gap-3
text-gray-400
"

>


<Database size={18}/>


Samples


</div>


<h3

className="
text-2xl
font-bold
mt-2
"

>


{sensorData.length}


</h3>



</div>








<div

className="
bg-white/5
border
border-white/10
rounded-2xl
p-4
"

>


<div

className="
flex
items-center
gap-3
text-gray-400
"

>


<Clock size={18}/>


Last Update


</div>



<h3

className="
text-lg
font-bold
mt-2
"

>


{

lastUpdate

?

lastUpdate.toLocaleTimeString()

:

"--"

}



</h3>



</div>









<div

className="
bg-white/5
border
border-white/10
rounded-2xl
p-4
"

>


<div

className="
flex
items-center
gap-3
text-gray-400
"

>


<Activity size={18}/>


Status


</div>



<h3

className="
text-lg
font-bold
mt-2
text-green-400
"

>


Monitoring


</h3>



</div>






</div>




</motion.div>
{/* =====================================================
    CHART SECTION
===================================================== */}


<div

className="
grid
grid-cols-1
xl:grid-cols-3
gap-6
"

>





{/* ================================
    TEMPERATURE CHART
================================ */}


<motion.div

whileHover={{
scale:1.03
}}

className={chartCard}

>


<div

className="
flex
items-center
gap-3
mb-5
"

>


<div

className="
p-3
rounded-xl
bg-red-500/10
"

>


<Thermometer

className="
text-red-400
"

/>


</div>



<h3

className="
text-xl
font-semibold
text-white
"

>

Temperature Trend

</h3>



</div>







<ResponsiveContainer

width="100%"

height={260}

>


<LineChart

data={sensorData}

>


<CartesianGrid

strokeDasharray="3 3"

stroke="#333"

/>



<XAxis

dataKey="time"

stroke="#888"

/>



<YAxis

stroke="#888"

/>



<Tooltip/>



<Line

type="monotone"

dataKey="temperature"

stroke="#ef4444"

strokeWidth={3}

dot={{
r:3
}}


/>



</LineChart>


</ResponsiveContainer>



</motion.div>









{/* ================================
    HUMIDITY CHART
================================ */}


<motion.div


whileHover={{
scale:1.03
}}


className={chartCard}


>


<div

className="
flex
items-center
gap-3
mb-5
"

>


<div

className="
p-3
rounded-xl
bg-blue-500/10
"

>


<Droplets

className="
text-blue-400
"

/>


</div>




<h3

className="
text-xl
font-semibold
text-white
"

>

Humidity Trend

</h3>



</div>








<ResponsiveContainer

width="100%"

height={260}

>


<AreaChart

data={sensorData}

>


<CartesianGrid

strokeDasharray="3 3"

stroke="#333"

/>



<XAxis

dataKey="time"

stroke="#888"

/>



<YAxis

stroke="#888"

/>



<Tooltip/>



<Area


type="monotone"


dataKey="humidity"


stroke="#3b82f6"


fill="#3b82f633"


strokeWidth={3}


/>



</AreaChart>


</ResponsiveContainer>






</motion.div>









{/* ================================
    MOISTURE CHART
================================ */}



<motion.div


whileHover={{
scale:1.03
}}


className={chartCard}


>



<div

className="
flex
items-center
gap-3
mb-5
"

>


<div

className="
p-3
rounded-xl
bg-cyan-500/10
"

>


<Waves

className="
text-cyan-400
"

/>


</div>



<h3

className="
text-xl
font-semibold
text-white
"

>

Moisture Trend

</h3>



</div>







<ResponsiveContainer

width="100%"

height={260}

>


<AreaChart

data={sensorData}

>


<CartesianGrid

strokeDasharray="3 3"

stroke="#333"

/>



<XAxis

dataKey="time"

stroke="#888"

/>



<YAxis

stroke="#888"

/>



<Tooltip/>



<Area


type="monotone"


dataKey="moisture"


stroke="#06b6d4"


fill="#06b6d433"


strokeWidth={3}


/>



</AreaChart>


</ResponsiveContainer>






</motion.div>





</div>



</section>


);


}



export default SensorAnalytics;