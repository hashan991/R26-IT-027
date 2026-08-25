import {motion} from "framer-motion";


export default function StatCard({
    title,
    value,
    icon,
    color
}){


return (

<motion.div

initial={{
    opacity:0,
    y:40
}}

animate={{
    opacity:1,
    y:0
}}

whileHover={{
    scale:1.05,
    y:-5
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
shadow-xl
"


>


<div className="
absolute
right-0
top-0
w-32
h-32
bg-purple-500/10
rounded-full
blur-3xl
">
</div>



<div className="
relative
flex
justify-between
items-center
">


<div className={`
${color}
p-3
rounded-2xl
bg-white/5
`}>
{icon}
</div>


</div>



<p className="
mt-6
text-gray-400
">

{title}

</p>



<h2 className="
text-4xl
font-bold
mt-2
">

{value}

</h2>



</motion.div>

)

}