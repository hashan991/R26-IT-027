import { useEffect, useState } from "react";
import { Clock } from "lucide-react";


function LastUpdated(){

    const [time,setTime] = useState(
        new Date()
    );


    useEffect(()=>{

        const timer = setInterval(()=>{

            setTime(new Date());

        },1000);


        return ()=>clearInterval(timer);


    },[]);



    return (

        <div
        className="
        flex
        items-center
        gap-2
        text-sm
        text-gray-400
        "
        >

            <Clock
            size={18}
            className="text-yellow-400"
            />


            <span>
                Last Updated:
            </span>


            <span
            className="
            text-white
            font-semibold
            "
            >

            {
                time.toLocaleTimeString()
            }

            </span>


        </div>

    );


}


export default LastUpdated;