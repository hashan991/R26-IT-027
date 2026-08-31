import {
    Coffee,
    LayoutDashboard,
    Database,
    Sparkles,
    FileText
} from "lucide-react";

import { motion } from "framer-motion";

import {
    useNavigate,
    useLocation
} from "react-router-dom";



export default function Sidebar(){


const navigate = useNavigate();
const location = useLocation();



const menu = [

{
name:"Dashboard",
path:"/powder",
icon:<LayoutDashboard size={21}/>
},


{
name:"Batch Intelligence",
path:"/powder/batch-intelligence",
icon:<Database size={21}/>
},


{
name:"Quality Intelligence",
path:"/powder/reports-system",
icon:<FileText size={21}/>
}

];





return(


<motion.aside


initial={{
x:-100,
opacity:0
}}


animate={{
x:0,
opacity:1
}}


transition={{
duration:0.5
}}



className="

fixed

left-0

top-0


w-[285px]


min-h-screen


z-50


flex

flex-col



px-6

py-5



bg-gradient-to-b

from-[#2A160B]

via-[#1E1008]

to-[#140904]



border-r

border-[#D89A32]/25



shadow-[20px_0_60px_rgba(80,40,10,0.35)]

"



>





{/* BRAND */}


<div

className="

flex

flex-col

items-center


mb-7

"

>


<div

className="

w-[68px]

h-[68px]


rounded-[22px]


flex

items-center

justify-center


bg-gradient-to-br

from-[#FFE7A8]

via-[#F6C85F]

to-[#C47A22]


shadow-[0_12px_30px_rgba(246,200,95,.35)]


border

border-[#FFF0C7]/50

"

>

<Coffee

size={34}

className="text-[#4A260C]"

/>


</div>





<h1

style={{

background:
"linear-gradient(90deg,#FFF8E7 0%,#F6C85F 45%,#D88932 100%)",

WebkitBackgroundClip:"text",

WebkitTextFillColor:"transparent",

backgroundClip:"text",

fontSize:"42px",

lineHeight:"1",

fontWeight:"900",

letterSpacing:"-1px"

}}

className="mt-3"

>

CoffeeSense

</h1>





<div

className="

flex

items-center

gap-2


mt-3

"

>


<Sparkles

size={15}

className="text-[#F6C85F]"

/>



<p

className="

text-sm

font-semibold


tracking-wide


text-[#E6C18B]

"

>

Coffee Intelligence

</p>


</div>



</div>







{/* MENU */}



<nav

className="

flex-1

space-y-3

"

>


{
menu.map((item,index)=>{


const active =
location.pathname === item.path;



return(


<motion.button


key={index}


onClick={()=>navigate(item.path)}



whileHover={{
x:5,
scale:1.02
}}



whileTap={{
scale:.97
}}



className={`

relative

overflow-hidden


w-full


flex

items-center


gap-4


px-5


py-4



rounded-2xl



transition-all



${

active

?


`

bg-gradient-to-r

from-[#F6C85F]

via-[#DFA13C]

to-[#C47A22]


text-[#321806]


font-bold


shadow-[0_12px_30px_rgba(246,200,95,.25)]

`

:

`

bg-[#FFFFFF08]


border

border-[#D89A32]/20


text-[#E8D6BC]


hover:bg-[#FFFFFF12]


hover:border-[#F6C85F]/40


`

}

`}


>


<div>

{item.icon}

</div>




<span

className="

text-[15px]

font-semibold

tracking-wide

"

>

{item.name}

</span>




{

active &&

<span

className="

absolute

right-5


w-2

h-2


rounded-full


bg-[#FFF3D0]


shadow-[0_0_15px_#FFF3D0]

"

/>

}


</motion.button>


)

})

}



</nav>








{/* SYSTEM STATUS */}



<motion.div


whileHover={{
scale:1.02
}}



className="


mt-5


rounded-3xl


p-5



bg-gradient-to-br

from-[#321B0E]

to-[#1B0D06]



border

border-[#D89A32]/30



shadow-xl


"


>


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

bg-emerald-400

animate-pulse

"

/>



<div>


<p

className="

text-emerald-300

font-bold

text-sm

"

>

System Online

</p>



<p

className="

text-xs

text-[#D8B98D]

mt-1

"

>

IoT + AI Monitoring Active

</p>


</div>



</div>


</motion.div>







{/* FOOTER */}



<div

className="

mt-5

pt-4


border-t

border-[#D89A32]/20

"

>


<p

className="

text-sm

font-black


text-[#FFF0D0]

"

>

CoffeeSense AI™

</p>



<p

className="

text-xs

text-[#C7A77A]

mt-2

leading-relaxed

"

>

Industrial Coffee Quality

<br/>

Intelligence Platform

<br/>

Version 1.0

</p>



</div>




</motion.aside>


)

}