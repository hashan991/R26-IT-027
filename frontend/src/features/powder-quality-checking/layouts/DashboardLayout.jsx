import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { Outlet } from "react-router-dom";


export default function DashboardLayout(){


return (

<div

className="
min-h-screen
bg-[#050505]
text-white
"

>


{/* Sidebar */}

<Sidebar />



{/* Main Area */}

<div

className="
ml-72
min-h-screen
"

>


<TopNavbar />



<main

className="
p-8
"

>

<Outlet />

</main>


</div>



</div>

)


}