import {
    useEffect,
    useState
} from "react";


import {
    motion
} from "framer-motion";


import {
    Activity,
    AlertTriangle,
    CheckCircle,
    ShieldAlert,
    PackageCheck,
    Factory,
    Brain,
    TrendingUp
} from "lucide-react";


import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";



import apiClient from "../api/apiClient";








function ProductionIntelligence(){



const [summary,setSummary] = useState(null);


const [current,setCurrent] = useState(null);


const [trend,setTrend] = useState([]);



const [loading,setLoading] = useState(true);


const [error,setError] = useState("");







// ======================================================
// LOAD PRODUCTION INTELLIGENCE DATA
// ======================================================


const fetchProductionData = async()=>{


try{


setLoading(true);



const [


summaryResponse,


currentResponse,


trendResponse



] = await Promise.all([



apiClient.get(

"/production/summary"

),



apiClient.get(

"/production/current"

),



apiClient.get(

"/production/trend"

)



]);





setSummary(

summaryResponse.data

);



setCurrent(

currentResponse.data

);



setTrend(

trendResponse.data

);



setError("");



}

catch(error){


console.error(

"Production Intelligence Error",

error

);



setError(

"Unable to load production intelligence data"

);



}

finally{


setLoading(false);


}



};








useEffect(()=>{


fetchProductionData();



const interval = setInterval(()=>{


fetchProductionData();


},60000);



return ()=>clearInterval(interval);



},[]);










// ======================================================
// RISK COLOR ENGINE
// ======================================================


const getRiskColor = (risk)=>{


if(risk==="HIGH"){


return "text-red-400";


}



if(risk==="MEDIUM"){


return "text-yellow-400";


}



if(risk==="LOW"){


return "text-green-400";


}



return "text-gray-400";


};









// ======================================================
// DECISION COLOR ENGINE
// ======================================================


const getDecisionColor = (decision)=>{


if(decision==="PASS"){


return "text-green-400";


}



if(decision==="HOLD"){


return "text-red-400";


}



return "text-yellow-400";


};










if(loading){


return(

<div className="
min-h-[400px]
flex
items-center
justify-center
text-gray-400
">


<Activity

className="
animate-spin
mr-3
text-yellow-400
"

/>


Loading Production Intelligence...


</div>


)


}








if(error){


return(

<div className="
text-center
mt-20
text-red-400
">


{error}


</div>


)

}









const decision =


current?.decision?.decision

||

current?.decision?.status

||

"UNKNOWN";





const risk =


current?.decision?.risk_level

||

current?.risk_level

||

"UNKNOWN";








return(



<div className="
space-y-10
">







{/* =====================================================
PRODUCTION COMMAND CENTER
===================================================== */}





<motion.div


initial={{
opacity:0,
y:30
}}


animate={{
opacity:1,
y:0
}}



className="
bg-white/5
border
border-white/10
rounded-3xl
p-8
backdrop-blur-xl
"

>



<div className="
flex
items-center
gap-4
mb-8
">



<div className="
p-4
rounded-2xl
bg-yellow-400/10
">


<Factory

className="
text-yellow-400
"

size={34}

/>


</div>





<div>


<h1 className="
text-3xl
font-bold
text-white
">

Production Intelligence Center

</h1>



<p className="
text-gray-400
mt-2
">

AI powered factory quality decision support

</p>



</div>




</div>









<div className="
grid
grid-cols-1
md:grid-cols-4
gap-6
">






{/* CURRENT BATCH */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Current Batch

</p>


<h2 className="
text-xl
font-bold
text-white
mt-3
">


{

current?.batch_id || "N/A"

}


</h2>


</div>








{/* AI DECISION */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

AI Decision

</p>



<h2 className={`

text-3xl

font-bold

mt-3

${getDecisionColor(decision)}

`}>



{decision}



</h2>



</div>









{/* RISK */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Risk Level

</p>



<h2 className={`

text-3xl

font-bold

mt-3

${getRiskColor(risk)}

`}>



{risk}



</h2>



</div>









{/* PACKAGING */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Packaging Gate

</p>



<h2 className="
text-xl
font-bold
text-white
mt-3
">


{

current?.decision?.release_status

||

"UNKNOWN"

}


</h2>



</div>






</div>







</motion.div>









{/* =====================================================
BATCH RISK RADAR
===================================================== */}





<div className="
grid
grid-cols-1
md:grid-cols-4
gap-6
">





<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
">


<CheckCircle

className="
text-green-400
mb-4
"

/>


<p className="
text-gray-400
">

Approved Batches

</p>



<h2 className="
text-4xl
font-bold
text-white
mt-2
">


{summary?.approved_batches || 0}



</h2>



</div>







<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
">


<AlertTriangle

className="
text-yellow-400
mb-4
"

/>


<p className="
text-gray-400
">

Review Required

</p>



<h2 className="
text-4xl
font-bold
text-white
mt-2
">


{summary?.review_required || 0}



</h2>



</div>







<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
">


<ShieldAlert

className="
text-red-400
mb-4
"

/>


<p className="
text-gray-400
">

Blocked Batches

</p>



<h2 className="
text-4xl
font-bold
text-white
mt-2
">


{summary?.blocked_batches || 0}



</h2>



</div>







<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
">


<TrendingUp

className="
text-cyan-400
mb-4
"

/>


<p className="
text-gray-400
">

Quality Rate

</p>



<h2 className="
text-4xl
font-bold
text-white
mt-2
">


{summary?.quality_rate || 0}%



</h2>



</div>





</div>
{/* =====================================================
QUALITY TREND INTELLIGENCE
===================================================== */}



<motion.div


initial={{
opacity:0,
y:30
}}


animate={{
opacity:1,
y:0
}}



className="
bg-white/5
border
border-white/10
rounded-3xl
p-8
backdrop-blur-xl
"



>



<div className="
flex
items-center
gap-3
mb-8
">


<Activity

className="
text-cyan-400
"

size={30}

/>



<div>


<h2 className="
text-2xl
font-bold
text-white
">

Quality Trend Intelligence

</h2>


<p className="
text-gray-400
text-sm
mt-1
">

Historical production quality performance

</p>


</div>



</div>







<div className="
h-[320px]
w-full
">


<ResponsiveContainer

width="100%"

height="100%"

>


<LineChart

data={trend}

>



<XAxis

dataKey="time"

stroke="#888"

/>



<YAxis

domain={[0,100]}

stroke="#888"

/>



<Tooltip/>





<Line


type="monotone"


dataKey="score"


stroke="#22c55e"


strokeWidth={3}


dot={{
r:4
}}



/>



</LineChart>


</ResponsiveContainer>



</div>







<div className="
mt-5
grid
grid-cols-1
md:grid-cols-3
gap-4
">





<div className="
bg-black/30
rounded-xl
p-4
">


<p className="
text-gray-400
text-sm
">

Latest Score

</p>


<p className="
text-2xl
font-bold
text-white
mt-2
">

{

trend.length > 0

?

trend[trend.length-1].score

:

0

}

%

</p>


</div>








<div className="
bg-black/30
rounded-xl
p-4
">


<p className="
text-gray-400
text-sm
">

Current Status

</p>


<p className="
text-2xl
font-bold
text-white
mt-2
">

{

trend.length > 0

?

trend[trend.length-1].status

:

"UNKNOWN"

}

</p>


</div>








<div className="
bg-black/30
rounded-xl
p-4
">


<p className="
text-gray-400
text-sm
">

Risk Trend

</p>


<p className="
text-2xl
font-bold
text-white
mt-2
">

{

trend.length > 0

?

trend[trend.length-1].risk

:

"UNKNOWN"

}

</p>


</div>





</div>





</motion.div>









{/* =====================================================
AI PREVENTIVE ACTION ENGINE
===================================================== */}





<motion.div


initial={{
opacity:0,
y:30
}}



animate={{
opacity:1,
y:0
}}



transition={{
delay:0.2
}}




className="
bg-gradient-to-br
from-yellow-400/10
to-orange-500/10
border
border-yellow-400/20
rounded-3xl
p-8
"



>




<div className="
flex
items-center
gap-4
mb-8
">


<div className="
p-3
rounded-2xl
bg-yellow-400/20
">


<Brain

className="
text-yellow-400
"

size={32}

/>


</div>





<div>


<h2 className="
text-2xl
font-bold
text-white
">

AI Preventive Action Engine

</h2>



<p className="
text-gray-400
">

AI generated corrective and prevention strategy

</p>


</div>



</div>









<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-6
">







{/* ROOT CAUSE INTELLIGENCE */}




<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<h3 className="
text-xl
font-semibold
text-white
mb-5
">

Root Cause Intelligence

</h3>







{

current?.root_cause?.length > 0

?


current.root_cause.map(

(item,index)=>(


<div

key={index}

className="
flex
gap-3
items-start
mb-4
"

>


<span className="
text-red-400
font-bold
">

⚠

</span>



<p className="
text-gray-300
">

{item}

</p>



</div>



)

)



:


<div className="
text-gray-400
">

No abnormal production cause detected

</div>


}





</div>









{/* RECOMMENDATIONS */}





<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<h3 className="
text-xl
font-semibold
text-white
mb-5
">

Recommended Actions

</h3>







{


current?.recommended_actions?.length > 0



?


current.recommended_actions.map(

(action,index)=>(


<div

key={index}

className="
flex
gap-3
items-start
mb-4
"

>


<span className="
text-yellow-400
font-bold
">

✓

</span>



<p className="
text-gray-300
">

{action}

</p>



</div>



)

)



:


<div className="
text-gray-400
">

No corrective actions required

</div>


}





</div>









</div>









{/* NEXT ACTION */}




<div className="
mt-8
bg-white/5
rounded-2xl
border
border-white/10
p-6
">


<p className="
text-gray-400
text-sm
">

AI Next Production Action

</p>



<h3 className="
text-xl
font-bold
text-white
mt-3
">


{

current?.next_action

||

"Continue monitoring production"

}


</h3>



</div>







</motion.div>
{/* =====================================================
PACKAGING READINESS DECISION
===================================================== */}



<motion.div


initial={{
opacity:0,
scale:0.95
}}


animate={{
opacity:1,
scale:1
}}



transition={{
delay:0.3
}}



className="
bg-gradient-to-br
from-purple-500/10
to-blue-500/10
border
border-purple-400/20
rounded-3xl
p-8
"



>




<div className="
flex
items-center
gap-4
mb-8
">


<div className="
p-4
rounded-2xl
bg-purple-400/20
">


<PackageCheck

className="
text-purple-300
"

size={36}

/>


</div>






<div>


<h2 className="
text-3xl
font-bold
text-white
">

Packaging Readiness Decision

</h2>



<p className="
text-gray-400
mt-2
">

AI final production release gate

</p>



</div>



</div>









<div className="
grid
grid-cols-1
lg:grid-cols-3
gap-6
">








{/* PACKAGING GATE */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Packaging Gate

</p>





<div className="
mt-5
flex
items-center
gap-4
">


<div className={`

w-16

h-16

rounded-full

flex

items-center

justify-center


${

decision==="PASS"

?

"bg-green-500/20"

:

"bg-red-500/20"

}

`}>


<PackageCheck

size={35}

className={

decision==="PASS"

?

"text-green-400"

:

"text-red-400"

}

/>


</div>




<div>


<h3 className={`

text-2xl

font-bold


${getDecisionColor(decision)}

`}>



{

decision==="PASS"

?

"OPEN"

:

"CLOSED"

}



</h3>



<p className="
text-gray-400
text-sm
">


Release:

{

current?.decision?.release_status || "UNKNOWN"

}


</p>



</div>



</div>



</div>









{/* FINAL DECISION */}





<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Final AI Decision

</p>



<h2 className={`

text-5xl

font-bold

mt-5


${getDecisionColor(decision)}

`}>



{decision}



</h2>



</div>









{/* FUTURE RISK */}



<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
">


<p className="
text-gray-400
text-sm
">

Future Production Risk

</p>




<h2 className={`

text-3xl

font-bold

mt-5


${getRiskColor(risk)}

`}>



{risk}



</h2>





<p className="
text-gray-400
text-sm
mt-3
">

Based on current environmental
and quality conditions.

</p>



</div>









</div>









{/* =====================================================
FINAL AI PRODUCTION RECOMMENDATION
===================================================== */}





<div className="
mt-8
bg-white/5
border
border-white/10
rounded-2xl
p-6
">





<h3 className="
text-xl
font-bold
text-white
mb-4
">

Final AI Production Recommendation

</h3>







<p className="
text-gray-300
leading-relaxed
">



{


decision==="PASS"

?


"Batch quality conditions are acceptable. Production can continue to packaging while maintaining normal monitoring."



:


decision==="HOLD"

?


"Packaging must remain blocked. Corrective actions should be completed and the batch must pass quality verification before release."



:


"Batch requires additional quality review before packaging approval."



}



</p>





</div>









{/* =====================================================
FUTURE RISK SUMMARY
===================================================== */}




<div className="
mt-6
grid
grid-cols-1
md:grid-cols-3
gap-6
">





<div className="
bg-white/5
border
border-white/10
rounded-2xl
p-5
">


<p className="
text-gray-400
text-sm
">

Current Risk

</p>



<p className={`

text-xl

font-bold

mt-3

${getRiskColor(risk)}

`}>



{risk}



</p>


</div>








<div className="
bg-white/5
border
border-white/10
rounded-2xl
p-5
">


<p className="
text-gray-400
text-sm
">

Recommended Next Step

</p>



<p className="
text-white
font-semibold
mt-3
">


{

current?.next_action

||

"Continue monitoring"

}



</p>


</div>








<div className="
bg-white/5
border
border-white/10
rounded-2xl
p-5
">


<p className="
text-gray-400
text-sm
">

AI Confidence

</p>



<p className="
text-white
text-xl
font-bold
mt-3
">


{

current?.decision?.confidence || 0

}%

</p>



</div>







</div>









</motion.div>









</div>

);


}





export default ProductionIntelligence;