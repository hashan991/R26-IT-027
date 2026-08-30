import {
    Coffee,
    LayoutDashboard,
    Database,
    Sparkles
} from "lucide-react";


import {
    motion
} from "framer-motion";


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
icon:<LayoutDashboard size={22}/>
},



{
name:"Batch Intelligence",
path:"/powder/batch-intelligence",
icon:<Database size={22}/>
}



];









return(


<motion.aside


initial={{
    x:-120,
    opacity:0
}}


animate={{
    x:0,
    opacity:1
}}


transition={{
    duration:0.6,
    ease:"easeOut"
}}




className="

fixed

left-0

top-0


w-[300px]


min-h-screen



bg-gradient-to-b

from-[#170C05]

via-[#241408]

to-[#0E0703]



border-r

border-[#5A3518]



px-7

py-6



z-50



flex

flex-col



shadow-[25px_0px_70px_rgba(0,0,0,0.65)]



"

>







{/* ===============================
 BRAND SECTION
================================ */}



<div


className="

flex

flex-col

items-center


mb-12

"

>






<div


className="


relative


w-[82px]

h-[82px]



rounded-[28px]



flex

items-center

justify-center





bg-gradient-to-br

from-[#FFD76A]

via-[#D99A32]

to-[#8B4513]




border

border-[#FFE9B0]/50





shadow-[0_20px_45px_rgba(217,154,50,0.45)]



"

>



<Coffee


size={42}


strokeWidth={2.5}


className="

text-white

drop-shadow-xl

"

/>


</div>







<h1


className="


mt-6


text-[36px]


font-black


tracking-tight


text-[#FFF4DE]


leading-none



drop-shadow-[0_0_20px_rgba(255,244,222,.35)]



"

>


CoffeeSense


</h1>







<div


className="

flex

items-center

gap-2


mt-4

"

>



<Sparkles


size={16}


className="

text-[#F6C85F]

"

/>





<p


className="


text-sm


font-semibold


text-[#D9B88A]


tracking-wide



"

>


AI Coffee Intelligence


</p>



</div>





</div>











{/* ===============================
 MENU
================================ */}



<nav


className="

flex-1

space-y-4

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

x:8,

scale:1.03

}}



whileTap={{

scale:0.96

}}





className={`


relative

overflow-hidden


w-full


flex


items-center


gap-5



px-6


py-[18px]



rounded-2xl



transition-all


duration-300



${



active



?



`

bg-gradient-to-r


from-[#F6C85F]


via-[#D99A32]


to-[#A85C20]




text-[#1B0D04]



font-bold



shadow-[0_18px_40px_rgba(246,200,95,.35)]



`





:



`



bg-[#211309]/80



border


border-[#4A2C18]



text-[#E8D9C7]



hover:bg-[#352015]


hover:border-[#D9A441]/50



hover:text-white



`

}



`}



>







<motion.div



animate={



active



?



{

scale:1.15,

rotate:5

}



:



{

scale:1,

rotate:0

}



}




transition={{

duration:.3

}}



>



{item.icon}



</motion.div>








<span


className="


text-[15px]


tracking-wide


font-semibold


"

>



{item.name}



</span>








{



active &&



<motion.span



layoutId="active-dot"



className="


absolute


right-6



w-2.5


h-2.5



rounded-full



bg-white



shadow-[0_0_18px_white]



"



/>



}





</motion.button>




)



})



}



</nav>












{/* ===============================
 SYSTEM STATUS
================================ */}



<motion.div


whileHover={{

scale:1.04

}}




className="


rounded-3xl


p-5


mb-6





bg-gradient-to-br


from-[#29150A]


to-[#130803]





border


border-[#5A3518]





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


block


w-3


h-3



rounded-full



bg-green-400



animate-pulse



"

/>






<div>



<p


className="


text-green-300


font-bold


text-sm


"

>


System Online


</p>






<p


className="


text-xs


text-[#D6BFA5]


mt-1


"

>


IoT + AI Monitoring Active


</p>




</div>




</div>



</motion.div>












{/* ===============================
 FOOTER
================================ */}



<div


className="


border-t


border-[#5A3518]


pt-5


"

>





<p


className="


text-sm


font-black


text-white


tracking-wide


"

>


CoffeeSense AI™


</p>






<p


className="


text-xs


text-[#C5A47E]


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