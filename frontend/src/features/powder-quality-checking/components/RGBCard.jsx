import { motion } from "framer-motion";


export default function RGBCard({
    red = 0,
    green = 0,
    blue = 0
}) {


const colors = [

{
name:"RED",
value:Number(red),
style:"text-red-400"
},

{
name:"GREEN",
value:Number(green),
style:"text-green-400"
},

{
name:"BLUE",
value:Number(blue),
style:"text-blue-400"
}

];



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


className="
p-6
rounded-3xl
bg-white/5
border
border-white/10
backdrop-blur-xl
"

>


<h2 className="
text-xl
font-semibold
">

🎨 RGB Color Analysis

</h2>



<div className="
mt-6
space-y-5
">


{
colors.map((c,index)=>(


<div key={index}>


<div className="
flex
justify-between
">


<span>
{c.name}
</span>


<span className={c.style}>

{c.value}

</span>


</div>



<div className="
h-2
bg-white/10
rounded-full
mt-2
">


<div

className={`
h-full
rounded-full
${c.style.replace("text","bg")}
`}


style={{

width:`${Math.min(
(c.value / 3000) * 100,
100
)}%`

}}


/>


</div>


</div>


))

}


</div>



</motion.div>

)

}