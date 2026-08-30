import { motion } from "framer-motion";

import {
    Coffee,
    Sparkles,
    CircleCheck
} from "lucide-react";



export default function CoffeePowderQualityCard(){


return (

<motion.div


initial={{
    opacity:0,
    y:25
}}


animate={{
    opacity:1,
    y:0
}}


transition={{
    duration:0.8,
    ease:"easeOut"
}}



className="

relative

overflow-hidden

rounded-[32px]


border

border-[#B87529]/30


bg-gradient-to-br

from-[#321B0F]

via-[#241208]

to-[#100703]


shadow-[0_25px_80px_rgba(45,22,8,0.55)]


px-7

py-8

mb-6

"

>


{/* =========================
    PREMIUM AMBIENT LIGHT
========================= */}


<motion.div

animate={{

scale:[1,1.15,1],

opacity:[0.3,0.6,0.3]

}}

transition={{

duration:6,

repeat:Infinity

}}

className="

absolute

right-[-120px]

top-[-120px]

w-[380px]

h-[380px]

rounded-full

bg-[#F6C85F]/20

blur-[120px]

"

/>



<motion.div

animate={{

scale:[1,1.2,1]

}}

transition={{

duration:8,

repeat:Infinity

}}

className="

absolute

bottom-[-150px]

left-[20%]

w-[400px]

h-[250px]

rounded-full

bg-[#8B4A1C]/30

blur-[120px]

"

/>





{/* moving golden scan */}

<motion.div


animate={{

x:["-120%","250%"]

}}


transition={{

duration:6,

repeat:Infinity,

ease:"linear"

}}


className="

absolute

top-0

left-0

w-40

h-full


bg-gradient-to-r

from-transparent

via-[#F6C85F]/10

to-transparent


blur-2xl

"

/>





<div

className="

relative

z-10

flex

flex-col

lg:flex-row

justify-between

gap-8

"

>





{/* =========================
       LEFT CONTENT
========================= */}


<div

className="

max-w-3xl

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



<div

className="

w-14

h-14

rounded-2xl


bg-gradient-to-br

from-[#F6C85F]

to-[#A86118]


flex

items-center

justify-center


shadow-[0_0_35px_rgba(246,200,95,0.35)]

"

>

<Coffee

className="

text-[#2A1407]

w-7

h-7

"

/>

</div>






<div>


<div

className="

flex

items-center

gap-2

"

>


<p

className="

text-[11px]

tracking-[3px]

uppercase

font-black

text-[#F6C85F]

"

>

COFFEE POWDER QUALITY INTELLIGENCE

</p>


<Sparkles

size={16}

className="text-[#F6C85F]"

/>


</div>





<div

className="

flex

items-center

gap-2

mt-2

"

>


<span

className="

w-2

h-2

rounded-full

bg-green-400

shadow-[0_0_15px_#22c55e]

"

/>


<p

className="

text-xs

font-bold

text-green-300

"

>

AI MONITORING ACTIVE

</p>


</div>



</div>


</div>







<h1

className="

text-5xl

font-black

leading-tight

text-[#FFF1D6]

"

>


Coffee Powder


<br/>


<span

className="

bg-gradient-to-r

from-[#F6C85F]

via-[#E9A83F]

to-[#B87325]

bg-clip-text

text-transparent

"

>

Quality Intelligence

</span>


</h1>








<p

className="

mt-6

max-w-xl

text-sm

leading-7

text-[#D0B08B]

"

>

AI-powered monitoring of coffee powder quality using
advanced sensors, computer vision and intelligent analytics
for consistent premium quality.

</p>






{/* INFO AREA */}


<div

className="

mt-8

flex

flex-wrap

gap-10

"

>


<div>

<p

className="

text-[9px]

tracking-[2px]

uppercase

text-[#987052]

font-bold

"

>

ANALYSIS TYPE

</p>


<p

className="

mt-2

text-[#FFF0D0]

font-bold

"

>

Vision + Sensor AI

</p>


</div>




<div>

<p

className="

text-[9px]

tracking-[2px]

uppercase

text-[#987052]

font-bold

"

>

TARGET

</p>


<p

className="

mt-2

text-[#FFF0D0]

font-bold

"

>

Coffee Powder Quality

</p>


</div>





<div>

<p

className="

text-[9px]

tracking-[2px]

uppercase

text-[#987052]

font-bold

"

>

SYSTEM

</p>


<div

className="

flex

items-center

gap-2

mt-2

text-green-300

font-bold

"

>

<CircleCheck size={16}/>

AI Ready

</div>


</div>



</div>



</div>



{/* =========================
      RIGHT SIDE AI VISION PANEL
      PREMIUM 2026 HUD UI
========================= */}


<div

className="

relative

w-full

lg:w-[430px]

h-[300px]


flex

items-center

justify-center


overflow-hidden


rounded-[34px]


translate-y-8

lg:translate-y-10


"

>





{/* ENERGY GLOW */}


<motion.div

animate={{

scale:[1,1.2,1],

opacity:[0.3,0.65,0.3]

}}

transition={{

duration:6,

repeat:Infinity

}}


className="

absolute

inset-0


rounded-full


bg-[#F6C85F]/20


blur-[100px]

"

/>








{/* OUTER ROTATING HUD */}



<motion.div

animate={{

rotate:360

}}

transition={{

duration:35,

repeat:Infinity,

ease:"linear"

}}

className="

absolute


w-[310px]

h-[310px]


rounded-full


border

border-[#F6C85F]/30


"

/>






<motion.div

animate={{

rotate:-360

}}

transition={{

duration:45,

repeat:Infinity,

ease:"linear"

}}

className="

absolute


w-[250px]

h-[250px]


rounded-full


border-dashed


border

border-[#D89A32]/40


"

/>










{/* IMAGE CONTAINER */}



<motion.div


animate={{

scale:[1,1.03,1]

}}


transition={{

duration:6,

repeat:Infinity,

ease:"easeInOut"

}}



className="


relative


z-10



w-[350px]


h-[225px]



rounded-[32px]


overflow-hidden




shadow-[0_0_70px_rgba(246,200,95,0.35)]



"

>



<img


src="/coffee-powder-quality.png"


alt="Coffee Powder Quality"


className="


w-full

h-full


object-cover



"

/>






{/* IMAGE BLENDING */}



<div


className="


absolute


inset-0



bg-gradient-to-t


from-[#140904]/90


via-transparent


to-[#140904]/20



"

/>







{/* MOVING AI SCAN */}



<motion.div


animate={{

y:["-120%","220%"]

}}


transition={{

duration:4,

repeat:Infinity,

ease:"linear"

}}


className="


absolute


left-0


w-full


h-20



bg-gradient-to-b


from-transparent


via-[#F6C85F]/30


to-transparent



blur-xl



"

/>




{/* HUD CORNER MARKERS */}


<div

className="

absolute

top-4

left-4


w-8

h-8


border-t

border-l


border-[#F6C85F]

"

/>



<div

className="

absolute

bottom-4

right-4


w-8

h-8


border-b

border-r


border-[#F6C85F]

"

/>




</motion.div>



















{/* FLOATING AI PARTICLES */}



<motion.div


animate={{


y:[0,-18,0],


opacity:[0.4,1,0.4]


}}


transition={{


duration:4,


repeat:Infinity


}}


className="


absolute


bottom-8


left-12



w-2


h-2



rounded-full



bg-[#F6C85F]



shadow-[0_0_20px_#F6C85F]


"

/>







<motion.div


animate={{


x:[0,30,0]


}}


transition={{


duration:5,


repeat:Infinity


}}


className="


absolute


bottom-8


right-16



w-28


h-[2px]



bg-gradient-to-r


from-transparent


via-[#F6C85F]


to-transparent



"

/>







</div>




</div>





</motion.div>


)

}