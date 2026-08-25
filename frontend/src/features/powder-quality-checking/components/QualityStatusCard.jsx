import {
    useEffect,
    useState
} from "react";


import {
    motion
} from "framer-motion";


import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    Lock,
    Activity
} from "lucide-react";


import apiClient from "../api/apiClient";





function QualityStatusCard(){


const [sensor,setSensor] = useState(null);

const [loading,setLoading] = useState(true);

const [error,setError] = useState("");






const fetchLatestSensor = async()=>{


try{


const response = await apiClient.get(
    "/sensor/latest"
);


setSensor(
    response.data
);


setError("");



}

catch(err){


console.log(err);


setError(
    "Unable to load AI production decision"
);


}


finally{


setLoading(false);


}


};







useEffect(()=>{


fetchLatestSensor();



const interval = setInterval(()=>{


fetchLatestSensor();


},30000);



return ()=>clearInterval(interval);



},[]);










if(loading){


return (

<div className="
bg-white/5
border
border-white/10
rounded-3xl
p-6
text-gray-400
animate-pulse
">

Loading AI Decision...


</div>

)

}







if(error){


return (

<div className="
bg-red-500/10
border
border-red-500/30
rounded-3xl
p-6
text-red-400
">

{error}

</div>

)

}






const ai = sensor?.ai_decision;



if(!ai){


return null;


}







const riskStyle =


ai.risk_level === "HIGH"

?

"bg-red-500/20 text-red-400 border-red-500/40"


:

ai.risk_level === "MEDIUM"

?

"bg-yellow-500/20 text-yellow-400 border-yellow-500/40"


:

"bg-green-500/20 text-green-400 border-green-500/40";







const releaseStyle =


ai.release_status === "BLOCKED"

?

"bg-red-500/10 text-red-400"


:

ai.release_status === "REVIEW_REQUIRED"

?

"bg-yellow-500/10 text-yellow-400"


:

"bg-green-500/10 text-green-400";









return (

<motion.div


initial={{
opacity:0,
y:30
}}


animate={{
opacity:1,
y:0
}}


whileHover={{
scale:1.02
}}


className="
bg-white/5
backdrop-blur-xl
border
border-white/10
rounded-3xl
p-6
shadow-2xl
"


>







{/* Header */}

<div className="
flex
justify-between
items-center
mb-8
">


<div className="
flex
items-center
gap-4
">


<div className="
p-4
rounded-2xl
bg-purple-500/10
">


<ShieldCheck

className="
text-purple-400
"

size={32}

/>


</div>



<div>


<h2 className="
text-xl
font-bold
text-white
">


AI Production Decision


</h2>


<p className="
text-gray-400
text-sm
">


Coffee batch intelligence status


</p>


</div>


</div>






<span className={`
px-4
py-2
rounded-full
border
text-sm
font-semibold
${riskStyle}
`}>

{ai.risk_level} RISK

</span>



</div>









{/* Decision */}

<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-6
mb-6
">


<div className="
flex
justify-between
items-center
">


<div>


<p className="
text-gray-400
text-sm
">


AI Decision


</p>


<h1 className="
text-4xl
font-bold
text-white
mt-2
">


{ai.decision}


</h1>


</div>





{

ai.decision === "PASS"

?

<CheckCircle

className="
text-green-400
"

size={45}

/>


:

<AlertTriangle

className="
text-red-400
"

size={45}

/>


}



</div>


</div>








{/* Release Status */}



<div className={`
rounded-2xl
p-5
mb-6
border
border-white/10
${releaseStyle}
`}>



<div className="
flex
items-center
gap-3
">


{

ai.release_status === "BLOCKED"

?

<Lock/>

:

<Activity/>

}



<div>


<p className="
text-sm
opacity-70
">

Batch Release Status

</p>



<h3 className="
text-xl
font-bold
">

{ai.release_status}

</h3>



</div>


</div>


</div>









{/* Metrics */}



<div className="
grid
grid-cols-1
md:grid-cols-3
gap-4
mb-6
">



<MetricCard

title="Condition Score"

value={`${ai.condition_score}%`}

/>




<MetricCard

title="AI Confidence"

value={`${ai.confidence}%`}

/>




<MetricCard

title="Recovery Probability"

value={
  ai.recovery_probability !== undefined &&
  ai.recovery_probability !== null
    ?
    `${ai.recovery_probability}%`
    :
    ai.decision === "PASS"
      ?
      "100%"
      :
      ai.decision === "HOLD"
        ?
        "70%"
        :
        "85%"
}

/>



</div>








{/* Root Cause */}



<div
className={`
rounded-2xl
p-5
border

${
ai.decision === "PASS"

?

"bg-green-500/10 border-green-500/30"

:

ai.decision === "HOLD"

?

"bg-red-500/10 border-red-500/30"

:

"bg-yellow-500/10 border-yellow-500/30"

}

`}
>


<div className="
flex
gap-3
">


{
ai.decision === "PASS"

?

<CheckCircle
className="text-green-400"
/>

:

ai.decision === "HOLD"

?

<AlertTriangle
className="text-red-400"
/>

:

<AlertTriangle
className="text-yellow-400"
/>

}


<div>


<h3 className="
text-white
font-semibold
">

AI Analysis

</h3>


<p className="
text-gray-300
mt-2
">

{
ai.decision === "PASS"

?

"Batch quality parameters are within acceptable range. No corrective action required."

:

ai.root_cause

}

</p>


</div>


</div>


</div>








{/* Next Action */}



<div className="
mt-6
bg-purple-500/10
border
border-purple-500/30
rounded-2xl
p-5
">


<p className="
text-purple-300
text-sm
">

Recommended Next Action

</p>


<p className="
text-white
font-semibold
mt-2
">

{ai.next_action}

</p>


</div>






</motion.div>


)

}








function MetricCard({
title,
value
}){


return (

<div className="
bg-black/30
border
border-white/10
rounded-2xl
p-4
">


<p className="
text-gray-400
text-sm
">

{title}

</p>


<h3 className="
text-2xl
font-bold
text-white
mt-2
">

{value}

</h3>


</div>


)

}





export default QualityStatusCard;