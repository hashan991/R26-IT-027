import {
  motion
} from "framer-motion";


import {
  Coffee,
  Activity,
  Cpu
} from "lucide-react";





export default function TopNavbar(){


return (



<motion.header



initial={{
opacity:0,
y:-25
}}


animate={{
opacity:1,
y:0
}}


transition={{
duration:0.7,
ease:"easeOut"
}}




className="

relative

h-24



flex

items-center

justify-between



px-8



overflow-hidden




bg-gradient-to-r

from-[#080403]

via-[#170C06]

to-[#080403]





border-b

border-[#5A3518]



shadow-[0_15px_50px_rgba(0,0,0,0.6)]



"

>







{/* TOP GOLD LIGHT */}



<motion.div


animate={{

x:["-100%","100%"]

}}


transition={{

duration:4,

repeat:Infinity,

ease:"linear"

}}



className="

absolute

top-0

left-0


h-[2px]

w-1/2


bg-gradient-to-r

from-transparent

via-[#F6C85F]

to-transparent

"


/>









{/* LEFT BRAND */}



<div

className="
flex
items-center
relative
z-10

ml-12
"

>






























{/* TITLE */}




<div>



<motion.p


initial={{
opacity:0,
x:-20
}}



animate={{
opacity:1,
x:0
}}



transition={{
duration:0.6
}}



className="


text-[15px]


uppercase


tracking-[5px]



font-black



text-[#F6C85F]



mb-1


"

>


COFFEE INTELLIGENCE


</motion.p>








<motion.h2

initial={{
opacity:0,
x:-15
}}

animate={{
opacity:1,
x:0
}}

transition={{
duration:0.8
}}

className="

text-2xl

font-black

tracking-tight


!text-[#F8E7C2]


drop-shadow-[0_0_18px_rgba(246,200,95,0.25)]

"

>

AI Coffee Quality Monitoring System

</motion.h2>








{/* AI SCAN LINE */}



<div


className="

mt-2

w-64

h-[2px]

rounded-full

bg-[#3A2110]

overflow-hidden

"

>



<motion.div



animate={{

x:["-100%","250%"]

}}



transition={{

duration:2.5,

repeat:Infinity,

ease:"linear"

}}




className="

h-full

w-20


bg-gradient-to-r

from-transparent

via-[#F6C85F]

to-transparent

"

/>




</div>




</div>






</div>









{/* RIGHT SIDE */}




<div


className="

flex

items-center

gap-4

relative

z-10

"

>










{/* AI PROCESSING */}




<motion.div


animate={{

opacity:[0.7,1,0.7]

}}



transition={{

duration:2,

repeat:Infinity

}}



className="

hidden

xl:flex

items-center

gap-3


px-5

py-3



rounded-2xl




bg-[#120905]/80




border

border-[#5A3518]



"

>



<div


className="

relative

w-10

h-10

flex

items-center

justify-center

"

>



<span


className="

absolute

w-10

h-10

rounded-full

bg-[#F6C85F]/20

animate-ping

"

/>


<Cpu


size={22}


className="

text-[#F6C85F]

"

/>



</div>






<div>


<p

className="

text-[10px]

tracking-[3px]

text-[#BFA78A]

"

>

AI ENGINE


</p>


<p

className="

text-sm

font-bold

text-[#FFF1D6]

"

>

Processing

</p>


</div>



</motion.div>









{/* SENSOR WAVE */}




<div


className="

hidden

lg:flex

items-center

gap-3



px-5

py-3



rounded-2xl



bg-[#120905]


border

border-[#5A3518]

"

>



<span

className="

text-xs

text-[#C8B49A]

"

>

IoT

</span>





<div

className="

flex

items-end

gap-1

h-5

"

>


{

[1,2,3,4,5].map((i)=>(


<motion.span


key={i}



animate={{

height:[6,18,8,15,6]

}}



transition={{

duration:1,

repeat:Infinity,

delay:i*0.15

}}



className="

w-1

rounded-full

bg-[#F6C85F]

"

/>


))


}



</div>



</div>









{/* LIVE SYSTEM */}





<div


className="

flex

items-center

gap-3



px-5

py-3



rounded-2xl




bg-gradient-to-r

from-[#102914]

to-[#071507]




border

border-green-500/30




"

>





<div

className="

relative

"

>


<span

className="

absolute

w-5

h-5

rounded-full

bg-green-400/30

animate-ping

"

/>


<span

className="

block

w-3

h-3

rounded-full

bg-green-400

shadow-[0_0_20px_#22c55e]

"

/>



</div>







<div>



<p


className="

text-[10px]

tracking-[3px]

text-green-200/70

"

>


STATUS


</p>




<p


className="

text-sm

font-black

text-green-300

flex

items-center

gap-1

"

>


<Activity size={14}/>


LIVE SYSTEM


</p>




</div>




</div>






</div>







</motion.header>



)

}