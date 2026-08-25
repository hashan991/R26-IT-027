import {
  useEffect,
  useState
} from "react";


import {
  useParams
} from "react-router-dom";


import {
  Loader2,
  AlertTriangle,
  Coffee,
  ShieldCheck,
  Droplets,
  Thermometer,
  Activity
} from "lucide-react";


import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";


import apiClient from "../../api/apiClient";






export default function CoffeeInspectionReport(){



const {

batchId

}=useParams();




const [report,setReport]=useState(null);

const [history,setHistory]=useState([]);

const [loading,setLoading]=useState(true);

const [error,setError]=useState("");







useEffect(()=>{


loadReport();


},[]);







const loadReport = async()=>{


try{


const latest = await apiClient.get(

"/sensor/latest"

);




const trends = await apiClient.get(

"/sensor/history"

);





setReport(

latest.data

);



setHistory(

trends.data.data || []

);





}


catch(err){


console.error(err);


setError(

"Unable to load AI report"

);


}


finally{


setLoading(false);


}



};









if(loading){


return(

<div className="
min-h-screen
bg-[#090604]
flex
items-center
justify-center
text-white
">


<Loader2 className="animate-spin mr-3"/>

Generating CoffeeSense AI Report...


</div>

);


}







if(error){


return(

<div className="
min-h-screen
bg-black
flex
items-center
justify-center
text-red-400
">


{error}


</div>


);


}







const ai = report.ai_decision || {};



const conditionScore =

report.condition_score ??

ai.condition_score ??

0;



const releaseStatus =

report.release_status ??

ai.release_status ??

"REVIEW_REQUIRED";








return(


<div

id="coffee-report"

className="
min-h-screen
bg-gradient-to-br
from-[#120805]
via-[#211006]
to-black

text-white

p-10

space-y-10
"


>






{/* HEADER */}


<section

className="
bg-white/5
border
border-white/10
rounded-3xl
p-8
flex
justify-between
"

>


<div>


<div className="
flex
items-center
gap-3
">


<Coffee className="
text-yellow-400
w-10
h-10
"/>


<h1 className="
text-4xl
font-black
">


CoffeeSense AI™

</h1>


</div>


<p className="
text-gray-400
mt-3
">


Industrial Coffee Quality Intelligence Report


</p>


</div>





<div className="
text-right
">


<p className="
text-gray-400
">

Batch ID

</p>


<h2 className="
text-xl
font-bold
">

{batchId || report.batch_id}

</h2>


</div>


</section>









{/* AI HERO */}


<section

className={`

rounded-3xl
p-10
border


${
ai.decision==="PASS"

?

"bg-green-500/10 border-green-400/30"

:

ai.decision==="WARN"

?

"bg-yellow-500/10 border-yellow-400/30"

:

"bg-red-500/10 border-red-400/30"

}


`

}

>


<div className="
flex
gap-4
items-center
">


<AlertTriangle

className="
text-yellow-400
w-10
h-10
"

/>


<h2 className="
text-xl
text-gray-300
">

AI RELEASE DECISION

</h2>


</div>





<h1 className="
text-7xl
font-black
mt-6
">


{ai.decision}


</h1>





<div className="
grid
grid-cols-3
gap-6
mt-8
">


<InfoCard

title="Risk Level"

value={ai.risk_level}


/>


<InfoCard

title="Release Status"

value={releaseStatus}


/>


<InfoCard

title="Confidence"

value={`${ai.confidence || 0}%`}


/>



</div>


</section>









{/* KPI */}


<div className="
grid
grid-cols-3
gap-6
">


<KPICard

title="Condition Score"

value={`${conditionScore}%`}

/>


<KPICard

title="Recovery Probability"

value={`${ai.recovery_probability || 0}%`}

/>


<KPICard

title="AI Confidence"

value={`${ai.confidence || 0}%`}

/>


</div>









{/* SENSOR CARDS */}



<section>


<h2 className="
text-3xl
font-bold
mb-6
">

Sensor Intelligence

</h2>


<div className="
grid
grid-cols-3
gap-6
">


<SensorCard

icon={<Droplets/>}

title="Moisture"

value={report.moisture}

/>



<SensorCard

icon={<Activity/>}

title="Humidity"

value={`${report.humidity}%`}

/>



<SensorCard

icon={<Thermometer/>}

title="Temperature"

value={`${report.temperature}°C`}

/>


</div>


</section>









{/* AI GAUGE */}



<section className="
bg-white/5
rounded-3xl
border
border-white/10
p-8
">


<h2 className="
text-2xl
font-bold
mb-6
">

AI Condition Intelligence

</h2>


<div className="
flex
justify-center
">


<div className="
w-52
h-52
rounded-full
border-[18px]
border-yellow-400
flex
items-center
justify-center
">


<div className="text-center">


<h1 className="
text-5xl
font-black
">

{conditionScore}

</h1>


<p className="text-gray-400">

INDEX

</p>


</div>


</div>


</div>


</section>









{/* TREND CHART */}



<section className="
bg-white/5
rounded-3xl
border
border-white/10
p-8
">


<h2 className="
text-2xl
font-bold
mb-6
">

Sensor Trend Analytics

</h2>



<ResponsiveContainer

width="100%"

height={300}

>


<LineChart data={history}>


<XAxis dataKey="time"/>

<YAxis/>


<Tooltip/>


<Line

dataKey="moisture"

stroke="#facc15"

strokeWidth={3}

/>



<Line

dataKey="humidity"

stroke="#38bdf8"

strokeWidth={3}

/>



</LineChart>


</ResponsiveContainer>


</section>









{/* RGB */}


<section className="
bg-white/5
rounded-3xl
border
border-white/10
p-8
">


<h2 className="
text-2xl
font-bold
">

RGB Coffee Color Intelligence

</h2>


<div className="
grid
grid-cols-3
gap-5
mt-6
">


<ColorBox

name="RED"

value={report.red}

/>


<ColorBox

name="GREEN"

value={report.green}

/>


<ColorBox

name="BLUE"

value={report.blue}

/>


</div>


</section>









{/* AI EXPLANATION */}



<section className="
bg-white/5
rounded-3xl
border
border-white/10
p-8
">


<h2 className="
text-2xl
font-bold
">

🧠 AI Root Cause Analysis

</h2>


<p className="
text-gray-300
mt-4
text-lg
">


{ai.root_cause || "No abnormal condition detected"}


</p>


</section>









{/* CERTIFICATE */}



<section className="
bg-gradient-to-r
from-yellow-500/20
to-orange-500/20

border
border-yellow-400/30

rounded-3xl
p-10
text-center
">


<ShieldCheck

className="
mx-auto
text-yellow-400
w-16
h-16
"

/>


<h1 className="
text-4xl
font-black
mt-4
">

QUALITY INSPECTION CERTIFICATE

</h1>


<p className="
mt-4
text-xl
">

CoffeeSense AI approved intelligent inspection report

</p>



</section>








</div>


);



}









function InfoCard({

title,

value

}){


return(

<div className="
bg-black/20
rounded-2xl
p-5
">


<p className="text-gray-400">

{title}

</p>


<h2 className="
text-xl
font-bold
mt-2
">

{value}

</h2>


</div>


);


}









function KPICard({

title,

value

}){


return(

<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-8
">


<p className="text-gray-400">

{title}

</p>


<h1 className="
text-4xl
font-black
text-yellow-400
mt-3
">

{value}

</h1>


</div>


);


}









function SensorCard({

icon,

title,

value

}){


return(

<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
">


<div className="
text-yellow-400
">

{icon}

</div>


<h3 className="
text-xl
font-bold
mt-3
">

{title}

</h3>


<h1 className="
text-4xl
font-black
mt-3
">

{value}

</h1>


</div>


);


}








function ColorBox({

name,

value

}){


return(

<div className="
bg-black/30
rounded-2xl
p-5
text-center
">


<h3 className="text-gray-400">

{name}

</h3>


<h1 className="
text-3xl
font-black
mt-2
">

{value}

</h1>


</div>


);


}