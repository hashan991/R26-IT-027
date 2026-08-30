import {
  useEffect,
  useState
} from "react";


import {
  motion,
  AnimatePresence
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
  CheckCircle2,
  X,
  Radio,
  Gauge,
  TrendingUp,
  Package,
  Zap,
  ChevronRight,
  Inbox
} from "lucide-react";


import apiClient from "../api/apiClient";



{/*// =====================================================
// SMALL PRESENTATIONAL HELPERS (visual-only, no logic)
// =====================================================*/}


const DECISION_STYLES = {

  PASS:{

    text:"!text-green-400",

    chip:"bg-green-400/15 !text-green-400 border border-green-400/30",

    glow:"shadow-[0_0_40px_-12px_rgba(74,222,128,0.35)]",

    ring:"#4ade80",

    Icon:CheckCircle2

  },

  WARN:{

    text:"!text-yellow-400",

    chip:"bg-yellow-400/15 !text-yellow-400 border border-yellow-400/30",

    glow:"shadow-[0_0_40px_-12px_rgba(250,204,21,0.35)]",

    ring:"#facc15",

    Icon:AlertTriangle

  },

  HOLD:{

    text:"!text-red-400",

    chip:"bg-red-400/15 !text-red-400 border border-red-400/30",

    glow:"shadow-[0_0_40px_-12px_rgba(248,113,113,0.35)]",

    ring:"#f87171",

    Icon:XCircle

  },

  UNKNOWN:{

    text:"!text-gray-400",

    chip:"bg-white/10 !text-gray-300 border border-white/10",

    glow:"",

    ring:"#9ca3af",

    Icon:Activity

  }

};


const getDecisionStyle = (decision)=> DECISION_STYLES[decision] || DECISION_STYLES.UNKNOWN;


const RISK_TEXT = {

  HIGH:"!text-red-400",

  MEDIUM:"!text-yellow-400",

  LOW:"!text-green-400",

  UNKNOWN:"!text-gray-400"

};


{/* Animated circular progress ring — purely visual */}

const CircularProgress = ({ value = 0, color = "#facc15", size = 96, stroke = 8, label, sub })=>{

  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return(

    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>

      <svg width={size} height={size} className="-rotate-90">

        <circle

          cx={size/2}

          cy={size/2}

          r={radius}

          stroke="rgba(255,255,255,0.08)"

          strokeWidth={stroke}

          fill="none"

        />

        <motion.circle

          cx={size/2}

          cy={size/2}

          r={radius}

          stroke={color}

          strokeWidth={stroke}

          fill="none"

          strokeLinecap="round"

          strokeDasharray={circumference}

          initial={{ strokeDashoffset:circumference }}

          animate={{ strokeDashoffset: circumference - (safeValue/100)*circumference }}

          transition={{ duration:1.1, ease:"easeOut" }}

        />

      </svg>

      <div className="absolute flex flex-col items-center justify-center">

        <span className="text-lg font-bold text-white">{Math.round(safeValue)}%</span>

        {sub && <span className="text-[10px] text-gray-500 uppercase tracking-wider">{sub}</span>}

      </div>

    </div>

  );

};


const containerStagger = {

  hidden:{ opacity:0 },

  show:{

    opacity:1,

    transition:{ staggerChildren:0.08, delayChildren:0.05 }

  }

};


const cardRise = {

  hidden:{ opacity:0, y:24 },

  show:{ opacity:1, y:0, transition:{ duration:0.45, ease:"easeOut" } }

};




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




{/*// =====================================================
// PREMIUM LOADING SKELETON (visual only — no logic)
// =====================================================*/}

if(loading){

  return(

    <div className="min-h-screen w-full py-6 sm:py-10 px-3 sm:px-6 relative bg-gradient-to-br from-[#faf1e2] via-[#f4e6cf] to-[#ecdab7]">

    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute -top-32 left-1/3 w-[34rem] h-[34rem] rounded-full bg-amber-200/40 blur-[130px]" />

      <div className="absolute top-1/4 -right-20 w-[28rem] h-[28rem] rounded-full bg-orange-100/40 blur-[120px]" />

    </div>

    <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#33220f] to-[#20150a] text-gray-100 shadow-2xl shadow-black/30 border border-black/40 p-6 sm:p-10 space-y-10">

      <div className="h-14 w-96 rounded-2xl bg-white/5 animate-pulse" />

      <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {[0,1,2].map((i)=>(

          <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />

        ))}

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {[0,1,2,3].map((i)=>(

          <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />

        ))}

      </div>

    </div>

    </div>

  );

}





return(

<div className="min-h-screen w-full py-6 sm:py-10 px-3 sm:px-6 relative bg-gradient-to-br from-[#faf1e2] via-[#f4e6cf] to-[#ecdab7]">


{/*// =====================================================
// LIGHT CREAM PAGE BACKDROP (visual only)
// =====================================================*/}

<div className="pointer-events-none absolute inset-0 overflow-hidden">

  <div className="absolute -top-32 left-1/3 w-[34rem] h-[34rem] rounded-full bg-amber-200/40 blur-[130px]" />

  <div className="absolute top-1/4 -right-20 w-[28rem] h-[28rem] rounded-full bg-orange-100/40 blur-[120px]" />

  <div className="absolute bottom-0 left-10 w-[26rem] h-[26rem] rounded-full bg-yellow-100/30 blur-[120px]" />

</div>



{/*// =====================================================
// FLOATING DARK CONTROL PANEL — the "roastery" shell
// =====================================================*/}

<div

className="
relative
rounded-[2rem]
sm:rounded-[2.5rem]
bg-gradient-to-b
from-[#33220f]
to-[#20150a]
text-gray-100
shadow-2xl
shadow-black/30
border
border-black/40
p-6
sm:p-10
space-y-10
overflow-hidden
"

>


{/*// =====================================================
// AMBIENT BACKGROUND GLOW (visual only)
// =====================================================*/}

<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

  <div className="absolute -top-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-yellow-500/10 blur-[120px]" />

  <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-purple-500/10 blur-[120px]" />

  <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-orange-500/10 blur-[120px]" />

</div>




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
flex-col
sm:flex-row
justify-between
sm:items-center
gap-5
"

>


<div className="flex items-start gap-4">


<div

className="
w-14
h-14
shrink-0
rounded-2xl
bg-gradient-to-br
from-yellow-400
via-orange-400
to-purple-500
flex
items-center
justify-center
shadow-[0_0_30px_-8px_rgba(250,204,21,0.6)]
"

>

<Package className="text-black" size={26} />

</div>



<div>


<div className="flex items-center gap-2">

<h1

className="
text-4xl
lg:text-5xl
font-black
tracking-tight
leading-tight

!bg-gradient-to-r
!from-[#FFF8E7]
!via-[#FFE0A0]
!to-[#F6C85F]

!text-transparent
bg-clip-text

drop-shadow-[0_0_35px_rgba(246,200,95,0.75)]

"

>

Batch Intelligence Center

</h1>

</div>



<p className="
text-gray-400
mt-3
flex
items-center
gap-2
">

<Radio size={14} className="text-green-400" />

AI driven production batch monitoring and decision support

</p>



</div>


</div>





<motion.button

whileHover={{ scale:1.04 }}

whileTap={{ scale:0.96 }}

onClick={fetchBatches}

className="
flex
gap-2
items-center
px-5
py-3
rounded-xl
bg-white/10
hover:bg-white/15
border
border-white/10
text-white
transition-colors
self-start
"

>

<RefreshCw

size={18}

className={refreshing?"animate-spin text-yellow-400":""}

/>

Refresh

</motion.button>




</div>



</motion.div>
{/*// =====================================================
// LIVE PRODUCTION BANNER
// =====================================================*/}


{

latestBatch && (()=>{

const style = getDecisionStyle(latestBatch.decision);

const DecisionIcon = style.Icon;

return(


<motion.div


initial={{
opacity:0,
scale:0.95
}}


animate={{
opacity:1,
scale:1
}}


transition={{ duration:0.5, ease:"easeOut" }}


className={`
relative
overflow-hidden
rounded-3xl
p-6
sm:p-8
bg-gradient-to-r
from-green-500/10
via-yellow-500/10
to-orange-500/10
border
border-yellow-400/20
${style.glow}
`}

>


<div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-yellow-400/10 blur-3xl" />



<div

className="
flex
flex-col
lg:flex-row
justify-between
lg:items-center
gap-6
relative
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


<span className="relative flex h-3 w-3">

<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />

<span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />

</span>


<h2

className="
text-xl
font-bold
tracking-wide
!text-white
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





<div className="flex items-center gap-4">


<div className="text-right">


<p className="text-gray-400">

Current Decision

</p>


<h2

className={`
text-3xl
font-bold
flex
items-center
gap-2
justify-end
${style.text}
`}

>

<DecisionIcon size={26} />

{latestBatch.decision}

</h2>


</div>


</div>



</div>




<div

className="
grid
grid-cols-1
sm:grid-cols-3
gap-4
mt-8
relative
"

>



<motion.div

whileHover={{ y:-4 }}

className="
bg-black/20
rounded-2xl
p-5
flex
items-center
justify-between
gap-4
border
border-white/5
"

>

<div>

<p className="text-gray-400 text-sm flex items-center gap-2">

<Gauge size={14} /> Quality

</p>


<p className="text-2xl font-bold mt-1">

{latestBatch.quality_score || 0}%

</p>

</div>

<CircularProgress value={latestBatch.quality_score || 0} color="#facc15" size={64} stroke={6} />

</motion.div>





<motion.div

whileHover={{ y:-4 }}

className="
bg-black/20
rounded-2xl
p-5
flex
items-center
justify-between
gap-4
border
border-white/5
"

>

<div>

<p className="text-gray-400 text-sm flex items-center gap-2">

<Zap size={14} /> Confidence

</p>


<p className="text-2xl font-bold mt-1">

{latestBatch.confidence}%

</p>

</div>

<CircularProgress value={latestBatch.confidence} color="#60a5fa" size={64} stroke={6} />

</motion.div>





<motion.div

whileHover={{ y:-4 }}

className="
bg-black/20
rounded-2xl
p-5
flex
items-center
justify-between
gap-4
border
border-white/5
"

>

<div>

<p className="text-gray-400 text-sm flex items-center gap-2">

<TrendingUp size={14} /> Recovery

</p>


<p className="text-2xl font-bold mt-1 text-green-400">

{latestBatch.recovery_probability}%

</p>

</div>

<CircularProgress value={latestBatch.recovery_probability} color="#4ade80" size={64} stroke={6} />

</motion.div>




</div>



</motion.div>


);

})()

}










{/*// =====================================================
// KPI CARDS
// =====================================================*/}



<motion.div

variants={containerStagger}

initial="hidden"

animate="show"

className="
grid
grid-cols-1
md:grid-cols-3
gap-6
"

>


<motion.div

variants={cardRise}

whileHover={{ y:-6 }}

className="
relative
overflow-hidden
rounded-3xl
p-6
bg-green-500/10
border
border-green-400/20
"

>

<div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-green-400/10 blur-2xl" />

<div

className="
w-11
h-11
rounded-xl
bg-green-400/15
flex
items-center
justify-center
mb-4
"

>

<ShieldCheck

className="text-green-400"

size={22}

/>

</div>


<h3 className="!text-gray-400">

Approved Batches

</h3>


<p className="
text-4xl
font-bold
mt-1
">

{passCount}

</p>



</motion.div>






<motion.div

variants={cardRise}

whileHover={{ y:-6 }}

className="
relative
overflow-hidden
rounded-3xl
p-6
bg-yellow-500/10
border
border-yellow-400/20
"

>

<div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-yellow-400/10 blur-2xl" />

<div

className="
w-11
h-11
rounded-xl
bg-yellow-400/15
flex
items-center
justify-center
mb-4
"

>

<AlertTriangle

className="text-yellow-400"

size={22}

/>

</div>



<h3 className="!text-gray-400">

Review Required

</h3>



<p className="
text-4xl
font-bold
mt-1
">

{warnCount}

</p>



</motion.div>







<motion.div

variants={cardRise}

whileHover={{ y:-6 }}

className="
relative
overflow-hidden
rounded-3xl
p-6
bg-red-500/10
border
border-red-400/20
"

>

<div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-red-400/10 blur-2xl" />

<div

className="
w-11
h-11
rounded-xl
bg-red-400/15
flex
items-center
justify-center
mb-4
"

>

<XCircle

className="text-red-400"

size={22}

/>

</div>



<h3 className="!text-gray-400">

Blocked

</h3>



<p className="
text-4xl
font-bold
mt-1
">

{holdCount}

</p>



</motion.div>



</motion.div>











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
focus-within:border-yellow-400/40
rounded-xl
px-4
py-3
flex-1
transition-colors
"

>


<Search

className="text-gray-400"

size={18}

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
placeholder:text-gray-500
"


/>



</div>





<div

className="
flex
gap-2
sm:gap-3
overflow-x-auto
"

>


{

["ALL","PASS","WARN","HOLD"].map((item)=>(


<button


key={item}


onClick={()=>setFilter(item)}


className={`

relative

px-5

py-3

rounded-xl

border

whitespace-nowrap

transition-colors

${

filter===item

?

"text-yellow-400 border-yellow-400"

:

"bg-white/5 border-white/10 text-gray-300 hover:border-white/20"

}

`}


>


{

filter===item &&

<motion.span

layoutId="filterPill"

className="absolute inset-0 rounded-xl bg-yellow-400/20"

transition={{ type:"spring", stiffness:400, damping:30 }}

/>

}


<span className="relative">{item}</span>


</button>



))


}



</div>


</div>









{/*// =====================================================
// INDUSTRIAL BATCH CARDS
// =====================================================*/}


{

filteredBatches.length === 0 ? (

<motion.div

initial={{ opacity:0 }}

animate={{ opacity:1 }}

className="
rounded-3xl
p-12
bg-white/5
border
border-white/10
flex
flex-col
items-center
justify-center
text-center
gap-3
"

>

<Inbox className="text-gray-500" size={36} />

<p className="text-gray-400">No batches match your search or filter</p>

</motion.div>

) : (


<motion.div

variants={containerStagger}

initial="hidden"

animate="show"

className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"

>



{

filteredBatches.map((batch,index)=>{

const style = getDecisionStyle(batch.decision);

const DecisionIcon = style.Icon;

return(


<motion.div


key={batch.record_id || `${batch.batch_id}-${batch.timestamp}-${index}`}


variants={cardRise}


whileHover={{
scale:1.02,
y:-4
}}


className={`
group
rounded-3xl
p-6
bg-white/5
hover:bg-white/[0.07]
border
border-white/10
hover:border-white/20
transition-colors
${style.glow}
`}

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
!text-white
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
flex
items-center
gap-1
">

<span className="relative flex h-1.5 w-1.5">

<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />

<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />

</span>

LIVE

</span>


}


</div>




<p className="text-gray-500 text-sm mt-2 flex items-center gap-1.5">

<Clock size={13} />

{formatDate(batch.timestamp)}

</p>


</div>






<span

className={`

px-4

py-2

h-fit

rounded-full

font-bold

flex

items-center

gap-1.5

${style.chip}

`}


>


<DecisionIcon size={15} />

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
border
border-white/5
group-hover:border-white/10
transition-colors
">

<Droplets size={18} className="text-blue-300" />

<p className="text-gray-400 text-sm mt-2">

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
border
border-white/5
group-hover:border-white/10
transition-colors
">

<Thermometer size={18} className="text-orange-300" />

<p className="text-gray-400 text-sm mt-2">

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
border
border-white/5
group-hover:border-white/10
transition-colors
">

<Activity size={18} className="text-yellow-300" />

<p className="text-gray-400 text-sm mt-2">

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

size={18}

/>


<h3 className="font-bold !text-white">

AI Recommendation

</h3>


</div>




<p className="text-red-300 font-semibold flex items-start gap-2">

<AlertTriangle size={16} className="mt-0.5 shrink-0" />

<span>{batch.root_cause}</span>

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
${RISK_TEXT[batch.risk_level] || RISK_TEXT.UNKNOWN}
`}

>

{batch.risk_level}

</p>



</div>




<motion.button

whileHover={{ scale:1.05 }}

whileTap={{ scale:0.95 }}

onClick={()=>setSelectedBatch(batch)}

className="
flex
items-center
gap-2
px-4
py-2
rounded-xl
bg-white/10
hover:bg-white/20
transition-colors
"

>


<Eye size={18}/>

View

<ChevronRight size={14} className="opacity-60" />

</motion.button>



</div>






</motion.div>


);

})


}



</motion.div>

)

}
{/*// =====================================================
// BATCH INTELLIGENCE MODAL
// =====================================================*/}


<AnimatePresence>

{

selectedBatch && (()=>{

const style = getDecisionStyle(selectedBatch.decision);

const DecisionIcon = style.Icon;

return(


<motion.div

initial={{ opacity:0 }}

animate={{ opacity:1 }}

exit={{ opacity:0 }}

onClick={()=>setSelectedBatch(null)}

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


onClick={(e)=>e.stopPropagation()}


initial={{
opacity:0,
scale:0.92,
y:20
}}


animate={{
opacity:1,
scale:1,
y:0
}}


exit={{
opacity:0,
scale:0.95,
y:10
}}


transition={{ type:"spring", stiffness:300, damping:28 }}


className="
w-full
max-w-4xl
max-h-[90vh]
overflow-y-auto
bg-[#1a1108]
text-gray-100
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


<div className="flex items-center gap-3">

<div

className="
w-11
h-11
rounded-xl
bg-gradient-to-br
from-yellow-400
via-orange-400
to-purple-500
flex
items-center
justify-center
"

>

<Sparkles className="text-black" size={20} />

</div>

<h2 className="
text-3xl
font-bold
!text-white
"

>

AI Batch Investigation Report

</h2>

</div>


<p className="
text-gray-400
mt-2
ml-14
"

>

{selectedBatch.batch_id}

</p>


</div>





<motion.button


whileHover={{ scale:1.1, rotate:90 }}


whileTap={{ scale:0.9 }}


onClick={()=>setSelectedBatch(null)}


className="
text-gray-400
hover:text-white
w-10
h-10
rounded-full
flex
items-center
justify-center
hover:bg-white/10
transition-colors
"

>

<X size={20} />

</motion.button>



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
border
border-white/5
"

>


<p className="text-gray-400">

Decision

</p>


<h3 className={`
text-3xl
font-bold
mt-1
flex
items-center
gap-2
${style.text}
`}

>

<DecisionIcon size={26} />

{selectedBatch.decision}

</h3>


</div>







<div

className="
bg-white/5
rounded-2xl
p-5
border
border-white/5
"

>


<p className="text-gray-400">

AI Confidence

</p>


<h3 className="
text-3xl
font-bold
mt-1
!text-white
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
border
border-white/5
"

>


<p className="text-gray-400">

Risk Level

</p>


<h3 className={`
text-3xl
font-bold
mt-1
${RISK_TEXT[selectedBatch.risk_level] || RISK_TEXT.UNKNOWN}
`}

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
flex
items-center
gap-2
!text-white
"

>

<TrendingUp size={20} className="text-green-400" />

Recovery Intelligence

</h3>



<div className="flex items-center gap-6 flex-wrap">


<CircularProgress

value={selectedBatch.recovery_probability}

color="#4ade80"

size={110}

stroke={9}

sub="Recovery"

/>


<div className="flex-1 min-w-[180px]">


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


<motion.div

className="
h-full
bg-gradient-to-r
from-green-500
to-green-300
rounded-full
"

initial={{ width:0 }}

animate={{

width:

`${selectedBatch.recovery_probability}%`

}}

transition={{ duration:1, ease:"easeOut" }}


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


</div>




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
!text-red-300
mb-3
flex
items-center
gap-2
"

>

<AlertTriangle size={18} />

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
!text-blue-300
mb-3
flex
items-center
gap-2
"

>

<ShieldCheck size={18} />

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
flex
items-center
gap-2
!text-white
"

>

<Zap size={18} className="text-yellow-400" />

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
flex
items-center
gap-2
!text-white
"

>

<Sparkles size={18} className="text-purple-300" />

Future Prevention Strategy

</h3>



<ul className="
space-y-2
text-gray-300
"

>


<li className="flex items-center gap-2">

<CheckCircle2 size={16} className="text-purple-300 shrink-0" />

Maintain controlled storage humidity

</li>


<li className="flex items-center gap-2">

<CheckCircle2 size={16} className="text-purple-300 shrink-0" />

Monitor environmental changes continuously

</li>


<li className="flex items-center gap-2">

<CheckCircle2 size={16} className="text-purple-300 shrink-0" />

Perform early quality inspection

</li>



</ul>



</div>









</motion.div>


</motion.div>


);

})()


}

</AnimatePresence>






{

lastUpdate &&


<p

className="
text-center
text-gray-500
text-sm
mt-8
flex
items-center
justify-center
gap-2
"

>

<span className="relative flex h-2 w-2">

<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />

<span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />

</span>

Last synchronization: {lastUpdate.toLocaleTimeString()}


</p>


}




</div>



</div>


)


}



export default BatchIntelligence;