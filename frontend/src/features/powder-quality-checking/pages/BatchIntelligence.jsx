import {
  useEffect,
  useState
} from "react";


import {
  motion
} from "framer-motion";


import {
  Search,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Droplets,
  Thermometer,
  Activity,
  Sparkles,
  Clock,
  CheckCircle2
} from "lucide-react";


import apiClient from "../api/apiClient";





function BatchIntelligence(){



const [batches,setBatches] = useState([]);

const [historyRecords,setHistoryRecords] = useState([]);

const [loading,setLoading] = useState(true);

const [refreshing,setRefreshing] = useState(false);

const [search,setSearch] = useState("");

const [filter,setFilter] = useState("ALL");

const [selectedBatch,setSelectedBatch] = useState(null);

const [lastUpdate,setLastUpdate] = useState(null);







{/*// =====================================================
// DATE + DATA FORMATTERS
// =====================================================*/}


const parseBackendDate = (value)=>{


if(!value){

return null;

}



const hasTimezone =

value.endsWith("Z")

||

/[+-]\d{2}:\d{2}$/.test(value);



const normalizedValue =

hasTimezone

?

value

:

`${value}Z`;



const date = new Date(

normalizedValue

);



if(Number.isNaN(date.getTime())){

return null;

}



return date;


};







const formatDate = (value)=>{


const date = parseBackendDate(

value

);



if(!date){

return "--";

}



return date.toLocaleString(

"en-US",

{

day:"2-digit",

month:"short",

year:"numeric",

hour:"2-digit",

minute:"2-digit"

}

);


};







// =====================================================
// HISTORY MINUTE KEY
//
// The dashboard saves one live reading every minute.
// If a manual refresh creates another reading in the
// same minute, keep only the latest one for summary counts.
// =====================================================

const getHistoryMinuteKey = (record)=>{


const timestamp =

record.time

||

record.timestamp;



const date = parseBackendDate(

timestamp

);



if(!date){

return (

record.record_id

||

`${record.batch_id || "LIVE-ARDUINO"}-${timestamp || "UNKNOWN"}`

);

}



return [

record.batch_id || "LIVE-ARDUINO",

date.getFullYear(),

date.getMonth(),

date.getDate(),

date.getHours(),

date.getMinutes()

].join("-");


};







const getDecision = (batch)=>{


return (

batch.ai_decision?.decision

||

batch.ai_decision?.status

||

batch.decision

||

batch.status

||

"UNKNOWN"

);


};






const getRisk = (batch)=>{


const backendRisk =

batch.ai_decision?.risk_level

||

batch.risk_level;



if(backendRisk){

return backendRisk;

}



const decision = getDecision(

batch

);



if(decision === "PASS"){

return "LOW";

}



if(decision === "WARN"){

return "MEDIUM";

}



if(decision === "HOLD"){

return "HIGH";

}



return "UNKNOWN";


};






const getConfidence = (batch)=>{


return (

batch.ai_decision?.confidence

??

batch.confidence

??

0

);


};






const getRecovery = (batch)=>{


const decision = getDecision(

batch

);



if(decision === "PASS"){

return 100;

}



return (

batch.ai_decision
?.recommendation
?.recovery_probability

??

batch.ai_decision
?.recovery_probability

??

batch.recovery_probability

??

0

);


};






const getRootCause = (batch)=>{


const decision = getDecision(

batch

);



if(decision==="PASS"){

return "No quality deviation detected. Production parameters are within acceptable range";

}



const cause =

batch.ai_decision?.root_cause

||

batch.root_cause

||

batch.root_causes;



if(Array.isArray(cause)){

return (

cause[0]

||

"Quality variation detected"

);

}



return cause || "Quality variation detected";


};







const getRecommendation = (batch)=>{


const decision = getDecision(

batch

);



if(decision==="PASS"){

return "Ready for packaging";

}



if(decision==="HOLD"){

return "Complete corrective action and validate quality";

}



if(decision==="WARN"){

return "Review batch condition before release";

}



return "Continue monitoring";


};








{/*// =====================================================
// FETCH DATA
// =====================================================*/}


const fetchBatches = async()=>{


try{


setRefreshing(true);



const response = await apiClient.get(

"/sensor/history?limit=500"

);



const data = response.data?.data || [];





// =====================================================
// COMPLETE PRODUCTION HISTORY SUMMARY
//
// Analyse all saved minute-by-minute readings so the
// Approved / Review Required / Blocked cards represent
// the actual production history, not only the latest batch.
// =====================================================

const historyByMinute = new Map();



data.forEach((record)=>{


const minuteKey = getHistoryMinuteKey(

record

);



historyByMinute.set(

minuteKey,

record

);


});



const fullHistory =

Array.from(

historyByMinute.values()

)

.map((record)=>({


...record,


decision:

getDecision(record),


risk_level:

getRisk(record),


quality_score:

record.ai_decision?.quality_score

??

record.quality_score

??

0,


confidence:

getConfidence(record)


}));



setHistoryRecords(

fullHistory

);





// =====================================================
// LATEST 50 PRODUCTION OUTPUTS
//
// Keep the newest 50 saved sensor + AI readings.
//
// ALL  -> all of these latest 50 outputs
// PASS -> PASS outputs inside these latest 50
// WARN -> WARN outputs inside these latest 50
// HOLD -> HOLD outputs inside these latest 50
// =====================================================


const latestBatches =

data

.map((reading)=>({


...reading,


batch_id:

reading.batch_id

||

"LIVE-ARDUINO",


timestamp:

reading.time


}))

.sort((a,b)=>{


const timeA =

parseBackendDate(

a.timestamp

)

?.getTime()

??

0;



const timeB =

parseBackendDate(

b.timestamp

)

?.getTime()

??

0;



return timeB - timeA;


})

.slice(0,50);






// =====================================================
// FORMAT BACKEND DATA FOR THE EXISTING UI
// =====================================================


const formatted = latestBatches.map((batch)=>({


...batch,


decision:

getDecision(batch),


release_status:

batch.ai_decision?.release_status

??

batch.release_status

??

"REVIEW_REQUIRED",


quality_score:

batch.ai_decision?.quality_score

??

batch.quality_score

??

0,


risk_level:

getRisk(batch),


confidence:

getConfidence(batch),


recovery_probability:

getRecovery(batch),


root_cause:

getRootCause(batch),


recommendation:

getRecommendation(batch)


}));




setBatches(

formatted

);


setLastUpdate(

new Date()

);



}

catch(error){


console.error(

"Batch intelligence error",

error

);



}


finally{


setLoading(false);

setRefreshing(false);



}


};









{/*// =====================================================
// AUTO LIVE UPDATE
// =====================================================*/}


useEffect(()=>{


fetchBatches();



const timer=setInterval(()=>{


fetchBatches();


},60000);



return()=>clearInterval(timer);



},[]);









const latestBatch = batches[0];







const passCount =
historyRecords.filter(
record=>record.decision==="PASS"
).length;


const warnCount =
historyRecords.filter(
record=>record.decision==="WARN"
).length;


const holdCount =
historyRecords.filter(
record=>record.decision==="HOLD"
).length;









const filteredBatches =
batches.filter((batch)=>{


const matchSearch =

batch.batch_id

?.toLowerCase()

.includes(

search.toLowerCase()

);



const matchFilter =

filter==="ALL"

||

batch.decision===filter;



return matchSearch && matchFilter;



});





return(

<div

className="
space-y-10
"

>





<motion.div


initial={{
opacity:0,
y:20
}}


animate={{
opacity:1,
y:0
}}


>


<div

className="
flex
justify-between
items-center
"

>


<div>


<h1

className="
text-4xl
font-bold
bg-gradient-to-r
from-yellow-400
via-orange-400
to-purple-500
text-transparent
bg-clip-text
"

>

Batch Intelligence Center

</h1>



<p className="
text-gray-400
mt-3
">

AI driven production batch monitoring and decision support

</p>



</div>





<button

onClick={fetchBatches}

className="
flex
gap-2
items-center
px-5
py-3
rounded-xl
bg-white/10
text-white
"

>

<RefreshCw

size={18}

className={refreshing?"animate-spin":""}

/>

Refresh

</button>




</div>



</motion.div>
{/*// =====================================================
// LIVE PRODUCTION BANNER
// =====================================================*/}


{

latestBatch && (


<motion.div


initial={{
opacity:0,
scale:0.95
}}


animate={{
opacity:1,
scale:1
}}


className="
rounded-3xl
p-6
bg-gradient-to-r
from-green-500/10
via-yellow-500/10
to-orange-500/10
border
border-yellow-400/20
"

>


<div

className="
flex
justify-between
items-center
"

>


<div>


<div

className="
flex
items-center
gap-3
"

>


<span

className="
w-3
h-3
rounded-full
bg-green-400
animate-pulse
"

/>


<h2

className="
text-xl
font-bold
"

>

LIVE PRODUCTION BATCH

</h2>



</div>




<p className="
text-gray-400
mt-3
">

Batch ID:

<span className="
text-yellow-400
font-bold
ml-2
">

{latestBatch.batch_id}

</span>


</p>



</div>





<div className="text-right">


<p className="text-gray-400">

Current Decision

</p>


<h2

className="
text-3xl
font-bold
text-yellow-400
"

>

{latestBatch.decision}

</h2>



</div>



</div>




<div

className="
grid
grid-cols-3
gap-4
mt-6
"

>



<div

className="
bg-black/20
rounded-xl
p-4
"

>

<p className="text-gray-400 text-sm">

Quality

</p>


<p className="text-2xl font-bold">

{latestBatch.quality_score || 0}%

</p>


</div>





<div

className="
bg-black/20
rounded-xl
p-4
"

>

<p className="text-gray-400 text-sm">

Confidence

</p>


<p className="text-2xl font-bold">

{latestBatch.confidence}%

</p>


</div>





<div

className="
bg-black/20
rounded-xl
p-4
"

>

<p className="text-gray-400 text-sm">

Recovery

</p>


<p className="text-2xl font-bold text-green-400">

{latestBatch.recovery_probability}%

</p>


</div>




</div>



</motion.div>


)

}










{/*// =====================================================
// KPI CARDS
// =====================================================*/}



<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-6
"

>


<div

className="
rounded-3xl
p-6
bg-green-500/10
border
border-green-400/20
"

>


<ShieldCheck

className="text-green-400 mb-3"

/>


<h3 className="text-gray-400">

Approved Batches

</h3>


<p className="
text-4xl
font-bold
">

{passCount}

</p>



</div>






<div

className="
rounded-3xl
p-6
bg-yellow-500/10
border
border-yellow-400/20
"

>


<AlertTriangle

className="text-yellow-400 mb-3"

/>



<h3 className="text-gray-400">

Review Required

</h3>



<p className="
text-4xl
font-bold
">

{warnCount}

</p>



</div>







<div

className="
rounded-3xl
p-6
bg-red-500/10
border
border-red-400/20
"

>


<XCircle

className="text-red-400 mb-3"

/>



<h3 className="text-gray-400">

Blocked

</h3>



<p className="
text-4xl
font-bold
">

{holdCount}

</p>



</div>



</div>











{/*// =====================================================
// SEARCH + FILTER
// =====================================================*/}


<div

className="
flex
flex-col
md:flex-row
gap-4
justify-between
"

>


<div

className="
flex
items-center
gap-3
bg-white/5
border
border-white/10
rounded-xl
px-4
py-3
flex-1
"

>


<Search

className="text-gray-400"

/>


<input


value={search}


onChange={(e)=>setSearch(e.target.value)}


placeholder="Search batch ID..."


className="
bg-transparent
outline-none
text-white
w-full
"


/>



</div>





<div

className="
flex
gap-3
"

>


{

["ALL","PASS","WARN","HOLD"].map((item)=>(


<button


key={item}


onClick={()=>setFilter(item)}


className={`

px-5

py-3

rounded-xl

border

${

filter===item

?

"bg-yellow-400/20 text-yellow-400 border-yellow-400"

:

"bg-white/5 border-white/10 text-gray-300"

}

`}


>


{item}


</button>



))


}



</div>


</div>









{/*// =====================================================
// INDUSTRIAL BATCH CARDS
// =====================================================*/}


<div

className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"

>



{

filteredBatches.map((batch,index)=>(


<motion.div


key={batch.record_id || `${batch.batch_id}-${batch.timestamp}-${index}`}


whileHover={{
scale:1.02
}}


className="
rounded-3xl
p-6
bg-white/5
border
border-white/10
"

>



<div

className="
flex
justify-between
"

>



<div>


<div className="flex items-center gap-3">


<h2 className="
text-xl
font-bold
">

{batch.batch_id}

</h2>



{

batch.record_id === latestBatch?.record_id &&

<span className="
text-xs
px-3
py-1
rounded-full
bg-green-400/20
text-green-400
">

LIVE

</span>


}


</div>




<p className="text-gray-500 text-sm mt-2">

{formatDate(batch.timestamp)}

</p>


</div>






<span

className={`

px-4

py-2

rounded-full

font-bold


${

batch.decision==="PASS"

?

"bg-green-400/20 text-green-400"

:

batch.decision==="WARN"

?

"bg-yellow-400/20 text-yellow-400"

:

"bg-red-400/20 text-red-400"

}

`}


>


{batch.decision}

</span>



</div>









<div

className="
grid
grid-cols-3
gap-3
mt-6
"

>


<div className="
bg-black/20
rounded-xl
p-4
">

<Droplets size={18}/>

<p className="text-gray-400 text-sm">

Moisture

</p>


<p className="font-bold">

{batch.moisture ?? "--"}

</p>


</div>







<div className="
bg-black/20
rounded-xl
p-4
">

<Thermometer size={18}/>

<p className="text-gray-400 text-sm">

Temperature

</p>


<p className="font-bold">

{batch.temperature ?? "--"}

</p>


</div>







<div className="
bg-black/20
rounded-xl
p-4
">

<Activity size={18}/>

<p className="text-gray-400 text-sm">

Quality

</p>


<p className="font-bold">

{batch.quality_score ?? 0}%

</p>


</div>



</div>









{/*// AI Recommendation*/}

<div

className="
mt-6
rounded-xl
p-5
bg-yellow-400/10
border
border-yellow-400/20
"

>


<div className="
flex
items-center
gap-2
mb-3
">

<Sparkles

className="text-yellow-400"

/>


<h3 className="font-bold">

AI Recommendation

</h3>


</div>




<p className="text-red-300 font-semibold">

⚠ {batch.root_cause}

</p>




<p className="text-gray-300 mt-3">

Action:

<span className="text-yellow-400 ml-2">

{batch.recommendation}

</span>


</p>



</div>








<div

className="
flex
justify-between
items-center
mt-5
"

>


<div>


<p className="text-gray-400 text-sm">

Risk

</p>


<p

className={`
font-bold
${
batch.risk_level==="HIGH"

?
"text-red-400"

:

batch.risk_level==="MEDIUM"

?

"text-yellow-400"

:

"text-green-400"

}

`}

>

{batch.risk_level}

</p>



</div>




<button

onClick={()=>setSelectedBatch(batch)}

className="
flex
items-center
gap-2
px-4
py-2
rounded-xl
bg-white/10
"

>


<Eye size={18}/>

View

</button>



</div>






</motion.div>



))


}



</div>
{/*// =====================================================
// BATCH INTELLIGENCE MODAL
// =====================================================*/}


{

selectedBatch && (


<div

className="
fixed
inset-0
z-50
bg-black/70
backdrop-blur-sm
flex
items-center
justify-center
p-5
"

>


<motion.div


initial={{
opacity:0,
scale:0.9
}}


animate={{
opacity:1,
scale:1
}}


className="
w-full
max-w-4xl
max-h-[90vh]
overflow-y-auto
bg-[#111]
border
border-white/10
rounded-3xl
p-8
"

>






<div

className="
flex
justify-between
items-center
"

>


<div>


<h2 className="
text-3xl
font-bold
"

>

AI Batch Investigation Report

</h2>


<p className="
text-gray-400
mt-2
"

>

{selectedBatch.batch_id}

</p>


</div>





<button


onClick={()=>setSelectedBatch(null)}


className="
text-gray-400
text-xl
"

>

✕

</button>



</div>









{/* DECISION */}


<div

className="
mt-8
grid
grid-cols-1
md:grid-cols-3
gap-4
"

>



<div

className="
bg-white/5
rounded-2xl
p-5
"

>


<p className="text-gray-400">

Decision

</p>


<h3 className="
text-3xl
font-bold
text-yellow-400
"

>

{selectedBatch.decision}

</h3>


</div>







<div

className="
bg-white/5
rounded-2xl
p-5
"

>


<p className="text-gray-400">

AI Confidence

</p>


<h3 className="
text-3xl
font-bold
"

>

{selectedBatch.confidence}%

</h3>


</div>








<div

className="
bg-white/5
rounded-2xl
p-5
"

>


<p className="text-gray-400">

Risk Level

</p>


<h3 className="
text-3xl
font-bold
text-red-400
"

>

{selectedBatch.risk_level}

</h3>


</div>




</div>









{/* RECOVERY INTELLIGENCE */}



<div

className="
mt-8
bg-green-400/10
border
border-green-400/20
rounded-3xl
p-6
"

>



<h3 className="
text-xl
font-bold
mb-4
"

>

Recovery Intelligence

</h3>





<p className="
text-gray-400
mb-3
"

>

Recovery Probability

</p>




<div

className="
w-full
h-4
bg-white/10
rounded-full
overflow-hidden
"

>


<div

className="
h-full
bg-green-400
rounded-full
transition-all
"

style={{

width:

`${selectedBatch.recovery_probability}%`

}}


/>



</div>




<p className="
mt-3
text-2xl
font-bold
text-green-400
"

>

{selectedBatch.recovery_probability}%

</p>




</div>









{/* ROOT CAUSE */}



<div

className="
mt-6
grid
md:grid-cols-2
gap-6
"

>




<div

className="
bg-red-400/10
border
border-red-400/20
rounded-2xl
p-5
"

>


<h3 className="
font-bold
text-red-300
mb-3
"

>

Root Cause Analysis

</h3>


<p className="text-gray-300">

{selectedBatch.root_cause}

</p>



</div>









<div

className="
bg-blue-400/10
border
border-blue-400/20
rounded-2xl
p-5
"

>


<h3 className="
font-bold
text-blue-300
mb-3
"

>

Corrective Actions

</h3>




<p className="text-gray-300">

{selectedBatch.recommendation}

</p>



</div>







</div>









{/* PRODUCTION DECISION */}



<div

className="
mt-6
bg-yellow-400/10
border
border-yellow-400/20
rounded-2xl
p-6
"

>



<h3 className="
text-xl
font-bold
mb-3
"

>

Production Decision

</h3>




<div className="
space-y-3
"

>


<p className="text-gray-300">


Current Action:


<span className="
text-yellow-400
ml-2
font-bold
"

>

{

selectedBatch.decision==="PASS"

?

"Release Batch"

:

selectedBatch.decision==="WARN"

?

"Review and Correct"

:

"Hold Production"

}



</span>


</p>





<p className="text-gray-300">


Next Step:


<span className="
text-green-400
ml-2
"

>


{

selectedBatch.recommendation

}


</span>


</p>



</div>



</div>









{/* FUTURE PREVENTION */}



<div

className="
mt-6
bg-purple-400/10
border
border-purple-400/20
rounded-2xl
p-6
"

>


<h3 className="
text-xl
font-bold
mb-3
"

>

Future Prevention Strategy

</h3>



<ul className="
space-y-2
text-gray-300
"

>


<li>

✓ Maintain controlled storage humidity

</li>


<li>

✓ Monitor environmental changes continuously

</li>


<li>

✓ Perform early quality inspection

</li>



</ul>



</div>









</motion.div>


</div>


)


}






{

lastUpdate &&


<p

className="
text-center
text-gray-500
text-sm
mt-8
"

>

Last synchronization:

{lastUpdate.toLocaleTimeString()}


</p>


}





</div>


)


}



export default BatchIntelligence; 