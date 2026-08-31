import {

    FileText,
    Activity,
    History

} from "lucide-react";


import BatchHistoryTable 
from "../components/BatchHistoryTable";


import SystemHealth 
from "../components/SystemHealth";





export default function ReportsSystem(){



return(



<div

id="report-page"

className="

min-h-screen

bg-gradient-to-br

from-[#F8F1E7]

via-[#EFE2D0]

to-[#E8D5BD]

text-[#3A1A08]

p-8

space-y-10

"

>






{/* HEADER */}



<div

className="

rounded-[32px]

border

border-[#C78B32]/40

bg-gradient-to-br

from-[#4A2A18]

via-[#362014]

to-[#241208]

p-10

shadow-[0_20px_60px_rgba(60,30,10,0.25)]

"

>



<div

className="

flex

items-center

gap-4

"

>


<FileText

className="

text-[#FFD36A]

w-10

h-10

"

/>





<h1
style={{
    color:"#FFE7A8",
    WebkitTextFillColor:"#FFE7A8",
    textShadow:"0 4px 20px rgba(246,200,95,0.35)"
}}

className="
text-4xl
font-black
tracking-tight
"

>
Quality Intelligence Center
</h1>


</div>





<p

className="
mt-4

text-[#F1D6B2]

text-lg

font-medium

"

>
Coffee production insights, batch history and system monitoring
</p>





</div>













{/* HISTORY */}



<div

className="

rounded-[32px]

border

border-[#C78B32]/40

bg-gradient-to-br

from-[#3A2114]

to-[#251208]

p-10

shadow-[0_20px_50px_rgba(40,20,5,0.25)]

"

>




<div

className="

flex

items-center

gap-4

mb-8

"

>


<History

className="
text-[#FFD36A]

w-8

h-8

drop-shadow-[0_0_12px_rgba(255,211,106,0.5)]

"

/>





<h2
style={{
    color: "#FFE7B0",
    fontSize: "32px",
    fontWeight: "900",
    letterSpacing: "-0.5px",
    textShadow: "0 0 18px rgba(246,200,95,0.25)"
}}
>
Production History
</h2>



</div>






<BatchHistoryTable />






</div>













{/* SYSTEM HEALTH */}



<div

className="

rounded-[32px]

border

border-[#C78B32]/40

bg-gradient-to-br

from-[#3A2114]

to-[#251208]

p-10

shadow-[0_20px_50px_rgba(40,20,5,0.25)]

"

>



<div

className="

flex

items-center

gap-4

mb-8

"

>


<Activity

className="

text-[#FFD36A]

w-7

h-7

"

/>




<h2
style={{
    color: "#FFE7B0",
    fontSize: "32px",
    fontWeight: "900",
    letterSpacing: "-0.5px",
    textShadow: "0 0 18px rgba(246,200,95,0.25)"
}}
>
System Health Monitoring
</h2>



</div>





<SystemHealth />






</div>









</div>



);


}