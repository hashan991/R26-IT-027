import { motion } from "framer-motion";


import {
  Cpu,
  Database,
  Brain,
  Server,
  CheckCircle
} from "lucide-react";




export default function SystemHealth(){



const systems=[


{
title:"Arduino Device",
status:"Ready",
icon:<Cpu/>,
color:"text-green-400"
},


{
title:"Database",
status:"Active",
icon:<Database/>,
color:"text-blue-400"
},


{
title:"AI Engine",
status:"Running",
icon:<Brain/>,
color:"text-purple-400"
},


{
title:"API Service",
status:"Online",
icon:<Server/>,
color:"text-cyan-400"
}


];





return(


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

mt-10

bg-white/5

backdrop-blur-xl

border

border-white/10

rounded-3xl

p-6

shadow-2xl

"

>



<div

className="

flex

items-center

justify-between

mb-6

"

>


<div>


<h2

className="

text-2xl

font-bold

"

>

System Health

</h2>


<p

className="

text-gray-400

mt-1

"

>

CoffeeSense AI infrastructure monitoring

</p>


</div>



<div

className="

flex

items-center

gap-2

bg-green-500/10

text-green-400

px-4

py-2

rounded-full

text-sm

"

>


<CheckCircle

size={18}

/>


All Systems Operational


</div>



</div>








<div

className="

grid

grid-cols-1

md:grid-cols-2

xl:grid-cols-4

gap-5

"

>



{

systems.map((item,index)=>(



<motion.div


key={index}


whileHover={{

scale:1.05

}}



className="

bg-white/5

border

border-white/10

rounded-2xl

p-5

"

>



<div

className={`

mb-4

${item.color}

`}

>

{item.icon}

</div>





<h3

className="

text-lg

font-semibold

"

>

{item.title}

</h3>




<div

className="

flex

items-center

gap-2

mt-3

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

></span>


<p

className="

text-green-400

font-medium

"

>

{item.status}

</p>


</div>



</motion.div>


))


}



</div>





</motion.div>



)


}