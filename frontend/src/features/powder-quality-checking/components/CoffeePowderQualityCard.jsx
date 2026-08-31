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
    y:30
}}


animate={{
    opacity:1,
    y:0
}}


transition={{
    duration:0.9,
    ease:"easeOut"
}}



className="

relative

overflow-hidden

rounded-[34px]


border

border-[#D89A32]/30


bg-gradient-to-br

from-[#351B0D]

via-[#241207]

to-[#0E0603]


shadow-[0_30px_100px_rgba(0,0,0,0.55)]


px-8

py-9

mb-6

"

>



{/* =========================
 PREMIUM LIGHT EFFECT
========================= */}



<motion.div

animate={{
scale:[1,1.2,1],
opacity:[0.25,0.6,0.25]
}}

transition={{
duration:7,
repeat:Infinity
}}

className="

absolute

right-[-150px]

top-[-150px]

w-[450px]

h-[450px]

rounded-full

bg-[#F6C85F]/20

blur-[130px]

"

/>



<motion.div

animate={{
scale:[1,1.15,1]
}}

transition={{
duration:8,
repeat:Infinity
}}

className="

absolute

bottom-[-180px]

left-[10%]

w-[450px]

h-[300px]

rounded-full

bg-[#A86118]/30

blur-[130px]

"

/>



{/* moving light scan */}

<motion.div

animate={{
x:["-120%","250%"]
}}

transition={{
duration:7,
repeat:Infinity,
ease:"linear"
}}

className="

absolute

top-0

left-0

w-44

h-full


bg-gradient-to-r

from-transparent

via-[#FFD978]/10

to-transparent


blur-3xl

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

gap-10

"

>



{/* =========================
 LEFT SIDE
========================= */}



<div

className="

max-w-3xl

"

>



{/* HEADER */}



<div

className="

flex

items-center

gap-4

mb-7

"

>


<div

className="

w-[58px]

h-[58px]


rounded-[20px]


bg-gradient-to-br

from-[#F6C85F]

to-[#B87325]


flex

items-center

justify-center


shadow-[0_0_40px_rgba(246,200,95,0.45)]

"

>


<Coffee

className="

text-[#241207]

w-8

h-8

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

uppercase

tracking-[3px]

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
MONITORING ACTIVE

</p>



</div>


</div>


</div>






{/* TITLE */}



<h1

style={{
color:"#FFF3DC"
}}

className="

text-5xl

lg:text-[58px]

font-black

leading-[1.05]

tracking-tight

drop-shadow-[0_0_20px_rgba(246,200,95,0.25)]

"

>

Coffee Powder


<br/>


<span

className="

bg-gradient-to-r

from-[#FFE29A]

via-[#F6C85F]

to-[#C57A22]


text-transparent

bg-clip-text

"

>

Quality Intelligence

</span>


</h1>






<p

className="

mt-7

max-w-xl

text-[15px]

leading-8

text-[#D8B88B]

"

>

Automated monitoring of coffee powder quality using advanced sensors, computer vision, and intelligent analytics to ensure consistent premium quality.

</p>






{/* INFO SECTION */}



<div

className="

mt-9

flex

flex-wrap

gap-12

"

>



<div>


<p

className="

text-[10px]

uppercase

tracking-[2px]

text-[#9B7654]

font-bold

"

>

ANALYSIS TYPE

</p>


<p

className="

mt-2

text-[#FFF1D5]

font-bold

"

>

Vision + Sensor

</p>


</div>





<div>


<p

className="

text-[10px]

uppercase

tracking-[2px]

text-[#9B7654]

font-bold

"

>

TARGET

</p>


<p

className="

mt-2

text-[#FFF1D5]

font-bold

"

>

Coffee Powder Quality

</p>


</div>




<div>


<p

className="

text-[10px]

uppercase

tracking-[2px]

text-[#9B7654]

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

<CircleCheck size={17}/>

Ready


</div>


</div>




</div>




</div>
{/* =========================
 RIGHT SIDE AI COFFEE VISION PANEL
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


rounded-[36px]


translate-y-6

lg:translate-y-8

"

>




{/* GOLDEN AI AMBIENT GLOW */}



<motion.div


animate={{

scale:[1,1.18,1],

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


bg-[#F6C85F]/25


blur-[110px]

"

/>






{/* OUTER HUD RING */}



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


w-[330px]

h-[330px]


rounded-full


border

border-[#F6C85F]/30


"

/>






{/* INNER TECH RING */}



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


w-[260px]

h-[260px]


rounded-full


border-dashed

border

border-[#D89A32]/50


"

/>







{/* IMAGE FRAME */}



<motion.div


animate={{

scale:[1,1.025,1],

y:[0,-3,0]

}}


transition={{

duration:6,

repeat:Infinity,

ease:"easeInOut"

}}



className="


relative

z-10



w-[360px]


h-[235px]



rounded-[34px]


overflow-hidden



border

border-[#F6C85F]/20



shadow-[0_0_80px_rgba(246,200,95,0.35)]


"

>




<img


src="/coffee-powder-quality.png"


alt="Coffee Powder Quality"


className="


w-full

h-full


object-cover


scale-[1.05]

"

/>







{/* CINEMATIC BLEND */}



<div


className="


absolute


inset-0



bg-gradient-to-t


from-[#120703]/90


via-transparent


to-[#120703]/20


"

/>







{/* MOVING AI SCANNER */}



<motion.div


animate={{


y:["-120%","250%"]


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


via-[#FFD978]/35


to-transparent



blur-xl


"

/>







{/* HUD CORNERS */}



<div

className="

absolute

top-5

left-5


w-10

h-10


border-t

border-l


border-[#F6C85F]


"

/>



<div

className="

absolute

bottom-5

right-5


w-10

h-10


border-b

border-r


border-[#F6C85F]


"

/>





</motion.div>






{/* FLOATING LIGHT PARTICLE */}



<motion.div


animate={{


y:[0,-18,0],


opacity:[0.3,1,0.3]


}}



transition={{


duration:4,


repeat:Infinity


}}



className="

absolute


bottom-10


left-12



w-2


h-2



rounded-full



bg-[#F6C85F]


shadow-[0_0_25px_#F6C85F]


"

/>








<motion.div


animate={{


x:[0,35,0]


}}



transition={{


duration:5,


repeat:Infinity


}}



className="

absolute


bottom-10


right-10



w-32


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