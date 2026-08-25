import {
  FileDown,
  Loader2,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";


import {
  useState
} from "react";


import {
  motion
} from "framer-motion";


import apiClient from "../api/apiClient";





function PDFReportButton({

  batchId

}){


const [loading,setLoading] = useState(false);

const [success,setSuccess] = useState(false);

const [error,setError] = useState("");








const downloadReport = async()=>{


if(!batchId){

setError(
"Batch ID not available"
);

return;

}



try{


setLoading(true);

setSuccess(false);

setError("");





const response = await apiClient.get(


`/report/pdf/${batchId}`,

{

responseType:"blob"

}


);






const pdfBlob = new Blob(

[response.data],

{

type:"application/pdf"

}

);






const url = window.URL.createObjectURL(

pdfBlob

);






const link = document.createElement("a");



link.href = url;



link.download =

`CoffeeSense_AI_Report_${batchId}.pdf`;






document.body.appendChild(link);



link.click();



document.body.removeChild(link);






window.URL.revokeObjectURL(url);






setSuccess(true);






setTimeout(()=>{


setSuccess(false);


},3000);




}



catch(error){


console.error(

"PDF Generation Error:",

error

);



setError(

"Unable to generate report"

);



}



finally{


setLoading(false);


}



};









return(



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

scale:1.02

}}



className="

mt-8

w-full

bg-white/5

backdrop-blur-xl

border

border-white/10

rounded-3xl

p-8

shadow-xl

flex

items-center

justify-between

gap-6

"


>



<div

className="

flex

items-center

gap-5

"

>


<div

className="

p-4

rounded-2xl

bg-yellow-400/10

"

>


<FileText

className="

text-yellow-400

w-8

h-8

"

/>


</div>






<div>


<h2

className="

text-2xl

font-bold

text-white

"

>

AI Quality Report

</h2>




<p

className="

text-gray-400

mt-2

"

>

Generate complete coffee quality analysis report with AI insights

</p>






<div

className="

flex

items-center

gap-2

mt-3

"

>


<span

className="

text-xs

text-gray-500

"

>

Batch:

</span>


<span

className="

text-xs

font-bold

text-yellow-400

"

>

{batchId || "Not Available"}

</span>



</div>






{

error &&

<div

className="

flex

items-center

gap-2

text-red-400

text-sm

mt-3

"

>


<AlertCircle

size={16}

/>


{error}


</div>


}




</div>


</div>









<motion.button



whileHover={{

scale:1.05

}}


whileTap={{

scale:0.95

}}



disabled={loading}



onClick={downloadReport}




className={`

flex

items-center

gap-3

px-7

py-4

rounded-2xl

font-bold

transition-all

duration-300



${

loading

?

"bg-gray-700 text-gray-300"

:

success

?

"bg-green-500 text-white"

:

"bg-gradient-to-r from-yellow-400 to-orange-500 text-black"

}

`}



>



{

loading

?

<>

<Loader2

className="animate-spin"

/>

Generating Report...

</>



:


success

?

<>

<CheckCircle/>

Report Downloaded ✓

</>



:


<>

<FileDown/>

Download PDF

</>



}



</motion.button>







</motion.div>


);


}




export default PDFReportButton;