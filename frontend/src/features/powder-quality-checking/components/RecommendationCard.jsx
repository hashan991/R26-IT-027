import {
  useEffect,
  useState
} from "react";


import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  RefreshCcw,
  Droplets,
  Thermometer,
  Wind,
  Brain,
  ShieldCheck,
  Activity,
  Target,
  TrendingUp,
  ClipboardCheck,
  PackageCheck
} from "lucide-react";


import apiClient from "../api/apiClient";





function RecommendationCard(){



const [data,setData] = useState(null);

const [loading,setLoading] = useState(true);

const [refreshing,setRefreshing] = useState(false);







{/*// ======================================================
// FETCH REAL TIME AI DECISION
// ======================================================*/}


const fetchRecommendation = async()=>{


try{


setRefreshing(true);



const response = await apiClient.get(
"/sensor/recommendation"
);



setData(response.data);



}

catch(error){


console.log(
"AI Recommendation Error:",
error
);



}


finally{


setLoading(false);

setRefreshing(false);


}



};








{/*// ======================================================
// AUTO REFRESH
// ======================================================*/}


useEffect(()=>{


fetchRecommendation();



const interval=setInterval(()=>{


fetchRecommendation();


},60000);



return()=>clearInterval(interval);



},[]);










if(loading){


return(

<div
className="
p-6
rounded-2xl
bg-black/40
border
border-white/10
text-white
"
>

Loading AI Intelligence...


</div>

)


}









{/*// ======================================================
// LIVE BACKEND VALUES
// ======================================================*/}


const decision =

data?.decision ||

data?.status ||

"WARN";



const riskLevel =

data?.risk_level ||

"MEDIUM";



const releaseStatus =

data?.release_status ||

"REVIEW_REQUIRED";



const qualityScore =

data?.quality_score ??

"--";



const confidence =

data?.confidence ??

"--";



const rootCauses =

data?.root_cause || [];



const actions =

data?.recommended_actions || [];



const nextAction =

data?.next_action ||

"Review production condition";










{/*// ======================================================
// INDUSTRIAL DECISION MAPPING
// ======================================================*/}


const getDecisionProfile=()=>{


if(decision==="PASS"){


return{


type:"PASS",


title:
"Production Ready - Packaging Approved",



description:

"AI verification confirms that the batch satisfies current quality requirements.",



risk:
"LOW",



status:
"APPROVED",



theme:"green",



icon:
<CheckCircle size={32}/>,



badge:
"PACKAGING READY",



summary:

"CoffeeSense AI recommends immediate packaging release.",

prevention:[
"Maintain current production parameter consistency",
"Continue preventive quality monitoring",
"Validate every batch before packaging release"
]





};



}







if(decision==="HOLD"){


return{


type:"HOLD",



title:

"Corrective Action Required Before Release",



description:

"Critical quality deviation detected. Batch release is blocked until corrective validation.",



risk:
"HIGH",



status:
"BLOCKED",



theme:"red",



icon:
<ShieldAlert size={32}/>,



badge:

"RELEASE BLOCKED",



summary:

"CoffeeSense AI recommends corrective recovery before packaging.",

prevention:[
"Optimize drying duration for future batches",
"Maintain humidity control during storage",
"Trigger early warning when moisture increases"
]



};



}







return{


type:"WARN",



title:

"Preventive Monitoring Required",



description:

"Quality variation detected. Additional verification is recommended before final release.",



risk:
"MEDIUM",



status:
"REVIEW REQUIRED",



theme:"yellow",



icon:
<AlertTriangle size={32}/>,



badge:

"QUALITY REVIEW",



summary:

"CoffeeSense AI recommends additional verification.",


prevention:[
"Increase monitoring frequency for next batches",
"Review moisture and environmental trends",
"Apply early corrective action before quality decline"
]



};



};






const profile=getDecisionProfile();






{/*// ======================================================
// THEME CONFIGURATION
// ======================================================*/}


const themes={


green:{


card:
"bg-green-950/40 border-green-500/30",


icon:
"bg-green-500/20 text-green-400",


text:
"text-green-400"


},


red:{


card:
"bg-red-950/40 border-red-500/30",


icon:
"bg-red-500/20 text-red-400",


text:
"text-red-400"


},


yellow:{


card:
"bg-yellow-950/40 border-yellow-500/30",


icon:
"bg-yellow-500/20 text-yellow-400",


text:
"text-yellow-400"


}



};



const theme = themes[profile.theme];






{/*// ======================================================
// RECOVERY / IMPACT CALCULATION
// ======================================================*/}


const recoveryScore =
  data?.recommendation?.recovery_probability ??
  (decision === "PASS" ? 100 : decision === "HOLD" ? 70 : 85);

const recoveryStatus =
  data?.recommendation?.recovery_possible === true
    ? "RECOVERY POSSIBLE"
    : data?.recommendation?.recovery_possible === false
      ? "RECOVERY NOT POSSIBLE"
      : "--";

const preventionStrategies = data?.recommendation?.future_prevention?.length
  ? data.recommendation.future_prevention
  : profile.prevention;





const displayedCauses =

rootCauses.length

?

rootCauses

:

[

"No abnormal production factors detected"

];



const displayedActions =

actions.length

?

actions

:

[

"Continue monitoring production condition"

];
return (
  <div
    className="
mt-10
rounded-3xl
bg-black/40
border
border-white/10
p-8
text-white
"
  >
    {/* ======================================================
HEADER
====================================================== */}

    <div
      className="
flex
justify-between
items-center
mb-8
"
    >
      <div
        className="
flex
items-center
gap-4
"
      >
        <div
          className={`
p-4
rounded-2xl

${theme.icon}

`}
        >
          {profile.icon}
        </div>

        <div>
          <h2
            className="
text-2xl
font-bold
"
          >
            AI Recovery Intelligence
          </h2>

          <p
            className="
text-gray-400
"
          >
            Industrial Coffee Quality Decision Support
          </p>
        </div>
      </div>

      <button
        onClick={fetchRecommendation}
        className="
flex
items-center
gap-2
px-4
py-2
rounded-xl
bg-white/10
hover:bg-white/20
transition
"
      >
        <RefreshCcw size={18} />

        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>

    {/* ======================================================
PRODUCTION STATUS BADGE
====================================================== */}

    <div
      className={`
rounded-2xl
border
p-6
mb-8

${theme.card}

`}
    >
      <div
        className="
flex
justify-between
items-center
"
      >
        <div>
          <p
            className="
text-gray-400
text-sm
"
          >
            Production Decision Status
          </p>

          <h1
            className={`
text-4xl
font-bold
mt-2

${theme.text}

`}
          >
            {profile.badge}
          </h1>
        </div>

        <PackageCheck size={45} />
      </div>

      <p
        className="
mt-5
text-lg
text-gray-300
"
      >
        {profile.summary}
      </p>
    </div>

    {/* ======================================================
DECISION SUMMARY
====================================================== */}

    <div
      className="
grid
grid-cols-1
md:grid-cols-3
gap-5
mb-8
"
    >
      <div
        className="
rounded-2xl
bg-white/5
border
border-white/10
p-5
"
      >
        <p
          className="
text-gray-400
"
        >
          AI Decision
        </p>

        <h3
          className={`
text-3xl
font-bold
mt-2

${theme.text}

`}
        >
          {decision}
        </h3>
      </div>

      <div
        className="
rounded-2xl
bg-white/5
border
border-white/10
p-5
"
      >
        <p
          className="
text-gray-400
"
        >
          Quality Score
        </p>

        <h3
          className="
text-3xl
font-bold
mt-2
"
        >
          {qualityScore}%
        </h3>
      </div>

      <div
        className="
rounded-2xl
bg-white/5
border
border-white/10
p-5
"
      >
        <p
          className="
text-gray-400
"
        >
          AI Confidence
        </p>

        <h3
          className="
text-3xl
font-bold
mt-2
"
        >
          {confidence}%
        </h3>
      </div>
    </div>

    {/* ======================================================
AI DIAGNOSIS
====================================================== */}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-5
"
      >
        <Brain size={25} />

        <h3
          className="
text-xl
font-bold
"
        >
          AI Diagnosis
        </h3>
      </div>

      <h2
        className="
text-2xl
font-bold
mb-3
"
      >
        {profile.title}
      </h2>

      <p
        className="
text-gray-300
text-lg
"
      >
        {profile.description}
      </p>
    </div>

    {/* ======================================================
RISK INTELLIGENCE
====================================================== */}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-5
"
      >
        <ShieldCheck size={25} />

        <h3
          className="
text-xl
font-bold
"
        >
          Risk Intelligence
        </h3>
      </div>

      <div
        className="
grid
grid-cols-1
md:grid-cols-3
gap-5
"
      >
        <div>
          <p
            className="
text-gray-400
"
          >
            Risk Level
          </p>

          <h3
            className={`
text-2xl
font-bold
mt-2

${
  riskLevel === "HIGH"
    ? "text-red-400"
    : riskLevel === "MEDIUM"
      ? "text-yellow-400"
      : "text-green-400"
}

`}
          >
            {riskLevel}
          </h3>
        </div>

        <div>
          <p
            className="
text-gray-400
"
          >
            Release Status
          </p>

          <h3
            className="
text-xl
font-bold
mt-2
"
          >
            {releaseStatus}
          </h3>
        </div>

        <div>
          <p
            className="
text-gray-400
"
          >
            Recovery Status
          </p>

          <h3
            className="
text-xl
font-bold
mt-2
"
          >
            {recoveryStatus}
          </h3>
        </div>
      </div>
    </div>

    {/* ======================================================
QUALITY EVIDENCE
====================================================== */}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-5
"
      >
        <ClipboardCheck size={25} />

        <h3
          className="
text-xl
font-bold
"
        >
          Quality Evidence
        </h3>
      </div>

      <div
        className="
space-y-3
"
      >
        {displayedCauses.map((item, index) => (
          <div
            key={index}
            className="
p-4
rounded-xl
bg-black/20
border
border-white/10
flex
gap-3
items-center
"
          >
            <Activity size={18} />

            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>

    {/* ======================================================
SENSOR CONDITION ANALYSIS
====================================================== */}

    <div
      className="
grid
grid-cols-1
md:grid-cols-3
gap-5
mb-8
"
    >
      <div
        className="
rounded-xl
bg-blue-950/30
border
border-blue-500/20
p-5
"
      >
        <Droplets
          className="
text-blue-400
"
        />

        <p
          className="
text-gray-400
mt-3
"
        >
          Moisture Condition
        </p>

        <h2
          className="
text-3xl
font-bold
"
        >
          {data?.moisture ?? "--"}
        </h2>
      </div>

      <div
        className="
rounded-xl
bg-red-950/30
border
border-red-500/20
p-5
"
      >
        <Thermometer
          className="
text-red-400
"
        />

        <p
          className="
text-gray-400
mt-3
"
        >
          Temperature
        </p>

        <h2
          className="
text-3xl
font-bold
"
        >
          {data?.temperature ?? "--"}
          °C
        </h2>
      </div>

      <div
        className="
rounded-xl
bg-cyan-950/30
border
border-cyan-500/20
p-5
"
      >
        <Wind
          className="
text-cyan-400
"
        />

        <p
          className="
text-gray-400
mt-3
"
        >
          Humidity
        </p>

        <h2
          className="
text-3xl
font-bold
"
        >
          {data?.humidity ?? "--"}%
        </h2>
      </div>
    </div>

    {/* ======================================================
CONFIDENCE VISUALIZATION
====================================================== */}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
justify-between
mb-3
"
      >
        <h3
          className="
font-bold
text-lg
"
        >
          AI Confidence Level
        </h3>

        <span
          className="
text-green-400
font-bold
"
        >
          {confidence}%
        </span>
      </div>

      <div
        className="
h-3
rounded-full
bg-gray-700
overflow-hidden
"
      >
        <div
          className="
h-full
bg-green-400
"
          style={{
            width: `${confidence}%`,
          }}
        />
      </div>
    </div>
    

    {/*// ======================================================
// RECOVERY WORKFLOW
// ======================================================*/}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-6
"
      >
        <Target size={25} />

        <h3
          className="
text-xl
font-bold
"
        >
          AI Recovery Workflow
        </h3>
      </div>

      <div
        className="
space-y-5
"
      >
        {displayedActions.map((action, index) => (
          <div
            key={index}
            className="
flex
gap-4
items-center
"
          >
            <div
              className="
relative
"
            >
              <div
                className="
w-10
h-10
rounded-full
bg-blue-500/20
border
border-blue-400/30
flex
items-center
justify-center
font-bold
text-blue-400
"
              >
                {index + 1}
              </div>
            </div>

            <div
              className="
flex-1
p-4
rounded-xl
bg-black/20
border
border-white/10
"
            >
              <p
                className="
text-gray-200
"
              >
                {action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/*// ======================================================
// RECOVERY PROBABILITY
// ======================================================*/}

    <div
      className="
rounded-2xl
bg-white/5
border
border-white/10
p-6
mb-8
"
    >
      <div
        className="
flex
justify-between
mb-4
"
      >
        <h3
          className="
text-xl
font-bold
"
        >
          Recovery Assessment
        </h3>

        <span
          className="
text-green-400
font-bold
"
        >
          {recoveryScore}%
        </span>
      </div>

      <div
        className="
h-3
rounded-full
bg-gray-700
overflow-hidden
"
      >
        <div
          className="
h-full
bg-green-400
"
          style={{
            width: `${recoveryScore}%`,
          }}
        />
      </div>

      <p
        className="
mt-4
text-gray-400
"
      >
        AI estimated recovery possibility based on current batch condition and
        corrective action availability.
      </p>
    </div>

    {/* // ======================================================
// NEXT PRODUCTION ACTION
// ======================================================*/}

    <div
      className="
rounded-2xl
bg-purple-950/30
border
border-purple-500/30
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-4
"
      >
        <Target size={24} />

        <h3
          className="
text-xl
font-bold
"
        >
          Next Production Action
        </h3>
      </div>

      <p
        className="
text-lg
text-gray-200
"
      >
        {nextAction}
      </p>
    </div>

    {/*// ======================================================
// FUTURE PREVENTION STRATEGY
// ======================================================*/}

    <div
      className="
rounded-2xl
bg-yellow-950/20
border
border-yellow-500/30
p-6
mb-8
"
    >
      <div
        className="
flex
items-center
gap-3
mb-5
"
      >
        <TrendingUp size={25} />

        <h3
          className="
text-xl
font-bold
"
        >
          Future Prevention Strategy
        </h3>
      </div>

      <div
        className="
space-y-3
"
      >
        {preventionStrategies.map((item, index) => (
          <div
            key={index}
            className="
p-3
rounded-xl
bg-black/20
"
          >
            ✓ {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);



}




export default RecommendationCard;