import {
  motion
} from "framer-motion";


import {
  useEffect,
  useState
} from "react";


import {
  Activity,
  Droplets,
  Thermometer,
  Gauge,
  Wind
} from "lucide-react";


import apiClient from "../api/apiClient";


import StatCard from "../components/StatCard";
import SensorCard from "../components/SensorCard";
import QualityStatusCard from "../components/QualityStatusCard";
import RGBCard from "../components/RGBCard";
import SensorAnalytics from "../components/SensorAnalytics";
import BatchHistoryTable from "../components/BatchHistoryTable";
import RecommendationCard from "../components/RecommendationCard";
import SystemHealth from "../components/SystemHealth";
import PDFReportButton from "../components/PDFReportButton";
import LastUpdated from "../components/LastUpdated";
import SensorConnection from "../components/SensorConnection";





function Dashboard(){



const [sensor,setSensor] = useState(null);

const [loading,setLoading] = useState(true);

const [error,setError] = useState(false);

const [refreshing,setRefreshing] = useState(false);

const [lastRefresh,setLastRefresh] = useState(null);





// =====================================================
// FETCH LIVE SENSOR DATA
// =====================================================

const fetchSensorData = async () => {
  try {
    setRefreshing(true);

    // =====================================================
    // READ A FRESH SAMPLE DIRECTLY FROM ARDUINO
    //
    // /device/read:
    // Arduino -> AI Analysis -> MongoDB Save -> Response
    // =====================================================

    const response = await apiClient.get("/device/read");

    const liveData = response.data?.data || {};

    const aiDecision = response.data?.ai_decision || {};

    // =====================================================
    // FORMAT RESPONSE FOR EXISTING DASHBOARD UI
    // =====================================================

    setSensor({
      ...liveData,

      batch_id: response.data?.batch_id || liveData.batch_id,

      ai_decision: aiDecision,
    });

    setError(false);

    setLastRefresh(new Date());
  } catch (err) {
    console.log("Live Arduino Sensor API Error:", err);

    setError(true);
  } finally {
    setLoading(false);

    setRefreshing(false);
  }
};







// =====================================================
// INDUSTRIAL LIVE POLLING
// Every 5 seconds
// =====================================================


useEffect(()=>{


// first load

fetchSensorData();



const interval = setInterval(()=>{


fetchSensorData();



},60000);



return ()=>{


clearInterval(interval);


};



},[]);







const liveSensor = sensor || {};







const stats = [


{

title:"Quality Score",

value:

liveSensor.ai_decision?.quality_score

?

`${liveSensor.ai_decision.quality_score}%`

:

"--",


icon:<Gauge/>,

color:"text-yellow-400"


},



{


title:"Moisture Level",


value:

liveSensor.moisture ?? "--",


icon:<Droplets/>,


color:"text-blue-400"


},




{


title:"Temperature",


value:

liveSensor.temperature

?

`${liveSensor.temperature} °C`

:

"--",


icon:<Thermometer/>,


color:"text-red-400"


},





{


title:"System Status",


value:

liveSensor.ai_decision?.status

||

"OFFLINE",


icon:<Activity/>,


color:"text-green-400"


}


];









return(


<div>





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
duration:0.6
}}



className="mb-10"



>







<div

className="
flex
justify-between
items-center
mb-6
"

>





<h2

className="
text-xl
font-semibold
text-white
"

>

CoffeeSense AI Control Center

</h2>







<div

className="
flex
items-center
gap-4
"

>







<button


onClick={fetchSensorData}


disabled={refreshing}


className="

px-4

py-2

rounded-xl

bg-white/10

border

border-white/10

text-white

hover:bg-white/20

transition

"


>


{


refreshing

?

"Refreshing..."

:

"🔄 Refresh"


}


</button>







<LastUpdated

time={lastRefresh}

/>





</div>





</div>










<SensorConnection

online={!error}

lastUpdate={lastRefresh}

/>









<h1

className="
mt-8
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


CoffeeSense AI Intelligence Dashboard


</h1>







<p

className="
text-gray-400
mt-3
text-lg
"

>


Real-time coffee quality monitoring and AI decision system


</p>








{

lastRefresh &&

<p

className="
text-gray-500
mt-2
text-sm
"

>


Last sync:

{lastRefresh.toLocaleTimeString()}


</p>


}







</motion.div>









<div

className="
grid
grid-cols-1
lg:grid-cols-3
gap-6
"

>







<QualityStatusCard

data={liveSensor.ai_decision}

/>










<SensorCard


title="Moisture Level"


value={

loading

?

"Loading..."

:

liveSensor.moisture ?? "--"

}



unit=""


icon={<Droplets/>}



status={

error

?

"Offline"

:

"Normal"

}



color="text-blue-400"


/>










<SensorCard


title="Temperature"



value={

loading

?

"Loading..."

:

liveSensor.temperature ?? "--"

}



unit="°C"



icon={<Thermometer/>}



status={

error

?

"Offline"

:

"Stable"

}



color="text-red-400"


/>









<SensorCard


title="Humidity"



value={

loading

?

"Loading..."

:

liveSensor.humidity ?? "--"

}



unit="%"



icon={<Wind/>}



status={

error

?

"Offline"

:

"Monitoring"

}



color="text-cyan-400"


/>









<RGBCard


red={liveSensor.red || 0}

green={liveSensor.green || 0}

blue={liveSensor.blue || 0}


/>







</div>









<div

className="
mt-10
space-y-10
"

>





<SensorAnalytics/>





<BatchHistoryTable/>





<RecommendationCard/>





<SystemHealth/>







<PDFReportButton

batchId={liveSensor.batch_id}

/>





</div>









<div

className="
mt-10
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-6
"

>





{

stats.map(

(item,index)=>(


<StatCard


key={index}


title={item.title}


value={item.value}


icon={item.icon}


color={item.color}


/>


)


)


}






</div>










</div>


)


}




export default Dashboard;