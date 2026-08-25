import {motion} from "framer-motion";


export default function SensorCard({
    title,
    value,
    unit,
    icon,
    status,
    color
}){


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

whileHover={{
scale:1.03
}}


className="
relative
overflow-hidden
p-6
rounded-3xl
bg-white/5
border
border-white/10
backdrop-blur-xl
"


>


<div className="
absolute
right-0
top-0
w-32
h-32
rounded-full
bg-white/10
blur-3xl
">
</div>



<div className="
flex
justify-between
items-center
relative
">


<div className={`
p-3
rounded-xl
bg-white/10
${color}
`}>

{icon}

</div>


<span className="
text-sm
text-gray-400
">

LIVE

</span>


</div>




<h3 className="
mt-6
text-gray-400
">

{title}

</h3>



<div className="
flex
items-end
gap-2
mt-2
">


<h2 className="
text-4xl
font-bold
">

{value}

</h2>


<span className="
text-gray-400
mb-1
">

{unit}

</span>


</div>



<div className="
mt-4
text-sm
text-green-400
">

● {status}

</div>


</motion.div>

)

}