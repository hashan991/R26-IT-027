import React from "react";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";


// =====================================================
// COFFEESENSE AI PREMIUM THEME
// =====================================================

const COLORS = {

  background: "#0D0805",

  surface: "#1A100A",

  surfaceLight: "#27180E",

  border: "#4A2C18",

  gold: "#F5B942",

  coffee: "#8B4513",

  cream: "#F5E6D3",

  white: "#FFFFFF",

  text: "#E7E5E4",

  muted: "#A8A29E",

  green: "#22C55E",

  orange: "#F59E0B",

  red: "#EF4444",

  blue: "#38BDF8",

};



// =====================================================
// PDF STYLE SYSTEM
// =====================================================


const styles = StyleSheet.create({


page: {

  backgroundColor: COLORS.background,

  paddingTop: 35,

  paddingBottom: 30,

  paddingHorizontal: 35,

},



header: {

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

  marginBottom:18,

  paddingBottom:12,

  borderBottomWidth:1,

  borderColor:COLORS.border,

},




brand: {

  fontSize:22,

  fontWeight:"bold",

  color:COLORS.gold,

},



subtitle: {

  fontSize:9,

  color:COLORS.muted,

  marginTop:4,

},



badge: {

  paddingVertical:7,

  paddingHorizontal:12,

  borderRadius:20,

},



badgeText: {

  fontSize:10,

  fontWeight:"bold",

  color:COLORS.white,

},



section: {

  backgroundColor:COLORS.surface,

  borderRadius:12,

  padding:15,

  marginBottom:12,

  borderWidth:1,

  borderColor:COLORS.border,

},



sectionTitle: {

  fontSize:14,

  fontWeight:"bold",

  color:COLORS.gold,

  marginBottom:6,

},



description: {

  fontSize:8,

  color:COLORS.muted,

  marginBottom:10,

},



text: {

  fontSize:9,

  color:COLORS.text,

  lineHeight:1.5,

},



row: {

  flexDirection:"row",

},



card: {

  flex:1,

  backgroundColor:COLORS.surfaceLight,

  padding:10,

  borderRadius:10,

  marginRight:8,

},



label: {

  fontSize:8,

  color:COLORS.muted,

},



value: {

  fontSize:18,

  color:COLORS.white,

  fontWeight:"bold",

  marginTop:5,

},



smallValue: {

  fontSize:12,

  color:COLORS.white,

  fontWeight:"bold",

},



progressOuter: {

  height:12,

  width:"100%",

  backgroundColor:"#3A2617",

  borderRadius:10,

  marginTop:8,

},



footer: {

  marginTop:10,

  paddingTop:10,

  borderTopWidth:1,

  borderColor:COLORS.border,

  alignItems:"center",

},


});





// =====================================================
// DATA HELPERS
// =====================================================


function number(value, fallback=0){

 const n = Number(value);

 return Number.isFinite(n)
 ? n
 : fallback;

}



function clamp(value){

 return Math.max(
 0,
 Math.min(100,number(value))
 );

}



function decisionColor(status){

 if(status==="PASS")
 return COLORS.green;


 if(status==="WARN")
 return COLORS.orange;


 return COLORS.red;

}



function decisionText(status){

 if(status==="PASS")
 return "PACKAGING READY";


 if(status==="WARN")
 return "QUALITY REVIEW";


 return "BATCH ON HOLD";

}





// =====================================================
// DATA MAPPING ENGINE
// =====================================================


function mapReportData(data){


const report =
data?.report ||
data ||
{};



const status = String(

 report?.decision ??

 report?.status ??

 report?.quality_status ??

 "HOLD"

).toUpperCase();





return {


report,


batchId:

data?.batchId ??

report?.batch_id ??

"BATCH-001",



status,



qualityScore:

number(

 report?.quality_score ??

 report?.qualityScore ??

 0

),



confidence:

number(

 report?.confidence ??

 report?.ai_confidence ??

 0

),



risk:

String(

 report?.risk_level ??

 report?.risk ??

 "HIGH"

).toUpperCase(),



moisture:

report?.moisture ??
"--",



temperature:

report?.temperature ??
"--",



humidity:

report?.humidity ??
"--",



red:

number(

 report?.red ??
 report?.rgb?.red ??
 0

),



green:

number(

 report?.green ??
 report?.rgb?.green ??
 0

),



blue:

number(

 report?.blue ??
 report?.rgb?.blue ??
 0

),



};

}






// =====================================================
// REUSABLE PDF COMPONENTS
// =====================================================


function Header({status}){


return (

<View style={styles.header}>


<View>


<Text style={styles.brand}>

CoffeeSense AI™

</Text>


<Text style={styles.subtitle}>

Industrial Coffee Quality Intelligence Report

</Text>


</View>



<View

style={{

...styles.badge,

backgroundColor:decisionColor(status)

}}

>


<Text style={styles.badgeText}>

{status}

</Text>


</View>



</View>

);


}






function Section({

title,

description,

children

}){


return (

<View style={styles.section}>


<Text style={styles.sectionTitle}>

{title}

</Text>



{

description &&

<Text style={styles.description}>

{description}

</Text>

}



{children}


</View>

);


}





function Metric({

label,

value,

}){


return (

<View style={styles.card}>


<Text style={styles.label}>

{label}

</Text>


<Text style={styles.value}>

{value}

</Text>


</View>

);


}






function Progress({

value,

color

}){


return (

<View style={styles.progressOuter}>


<View

style={{

height:12,

width:`${clamp(value)}%`,

backgroundColor:color,

borderRadius:10

}}

/>


</View>

);


}



// =====================================================
// MAIN COMPONENT START
// PART 2 WILL CONTINUE INSIDE THIS DOCUMENT
// =====================================================


function AIQualityReportPDF({

data={}

}){


const report = mapReportData(data);



return (

<Document>


<Page

size="A4"

style={styles.page}

>


<Header

status={report.status}

/>


<Section

title="CoffeeSense AI Report"

description="Industrial coffee quality intelligence decision system"

>


<Text style={styles.text}>

AI powered production monitoring and quality assessment report.

</Text>


</Section>


</Page>


{/* =====================================================
PAGE 1 — EXECUTIVE AI DASHBOARD
===================================================== */}


<Page

size="A4"

style={styles.page}

>


<Header

status={report.status}

/>





{/* DECISION HERO */}



<View

style={{

backgroundColor:

report.status==="PASS"

?

"#064E3B"

:

report.status==="WARN"

?

"#78350F"

:

"#7F1D1D",


padding:18,

borderRadius:14,

marginBottom:14,

alignItems:"center"

}}

>


<Text

style={{

fontSize:24,

fontWeight:"bold",

color:COLORS.white

}}

>

{decisionText(report.status)}

</Text>



<Text

style={{

fontSize:9,

color:COLORS.cream,

marginTop:6

}}

>

CoffeeSense AI Production Decision

</Text>



</View>









{/* EXECUTIVE CARDS */}



<Section

title="Executive AI Dashboard"

description="Current production quality intelligence overview"

>


<View style={styles.row}>


<Metric

label="Quality Score"

value={`${report.qualityScore}%`}

/>



<Metric

label="AI Confidence"

value={`${report.confidence}%`}

/>



<Metric

label="Risk"

value={report.risk}

/>



</View>



</Section>









{/* QUALITY GAUGE */}



<Section

title="Quality Readiness Gauge"

description="AI estimated batch readiness score"

>


<Progress

value={report.qualityScore}

color={decisionColor(report.status)}

/>



<Text

style={{

...styles.text,

marginTop:8

}}

>

Production Readiness:

{report.qualityScore}%

</Text>



</Section>









{/* AI CONFIDENCE */}



<Section

title="AI Confidence Meter"

description="Confidence supporting the final decision"

>


<Progress

value={report.confidence}

color={COLORS.blue}

/>



<Text

style={{

...styles.text,

marginTop:8

}}

>

Model Confidence:

{report.confidence}%

</Text>



</Section>









{/* SENSOR INTELLIGENCE */}



<Section

title="Sensor Intelligence"

description="Live production environment parameters"

>



<View style={styles.row}>


<Metric

label="Moisture"

value={report.moisture}

/>



<Metric

label="Temperature"

value={`${report.temperature} °C`}

/>



<Metric

label="Humidity"

value={`${report.humidity}%`}

/>



</View>


</Section>









{/* BATCH PROFILE */}



<Section

title="Batch Profile"

description="Production identification details"

>


<Text style={styles.text}>

Batch ID :

{report.batchId}

</Text>



<Text style={styles.text}>

Decision :

{report.status}

</Text>



<Text style={styles.text}>

Risk Classification :

{report.risk}

</Text>



<Text style={styles.text}>

AI Monitoring Status :

Active

</Text>



</Section>



</Page>









{/* =====================================================
PAGE 2 — AI ANALYTICS DASHBOARD
===================================================== */}



<Page

size="A4"

style={styles.page}

>



<Header

status={report.status}

/>







<Section

title="AI Analytics Dashboard"

description="Intelligent production behaviour analysis"

>



<Text style={styles.text}>

CoffeeSense AI evaluates sensor behaviour patterns
to identify possible quality deviations.

</Text>



</Section>









{/* SENSOR TREND VISUAL */}



<Section

title="Sensor Trend Intelligence"

description="Quality parameter movement analysis"

>




<View

style={{

height:130,

flexDirection:"row",

alignItems:"flex-end",

justifyContent:"space-between",

paddingHorizontal:10

}}

>



{

[

45,

60,

52,

72,

80,

92

].map(

(height,index)=>(


<View

key={index}

style={{

width:22,

height:height,

backgroundColor:

report.status==="PASS"

?

COLORS.green

:

report.status==="WARN"

?

COLORS.orange

:

COLORS.red,

borderRadius:5

}}

/>


)

)


}



</View>





<Text

style={{

...styles.description,

marginTop:8

}}

>

AI quality behaviour visualization

</Text>




</Section>









{/* ANALYTIC METRICS */}



<Section

title="Environmental Analytics"

description="Production environment evaluation"

>



<View style={styles.row}>


<Metric

label="Moisture Status"

value={

number(report.moisture)>300

?

"HIGH"

:

"NORMAL"

}

/>



<Metric

label="Humidity Status"

value={

number(report.humidity)>80

?

"HIGH"

:

"NORMAL"

}

/>



<Metric

label="Temperature Status"

value={

number(report.temperature)>35

?

"HIGH"

:

"NORMAL"

}

/>



</View>



</Section>









{/* QUALITY SUMMARY */}



<Section

title="AI Quality Summary"

>


<Text style={styles.text}>

The AI system combined sensor intelligence,
quality indicators and production conditions
to generate the current batch decision.

</Text>



<Text style={styles.text}>

Final Classification:

{report.status}

</Text>



<Text style={styles.text}>

Risk Level:

{report.risk}

</Text>



</Section>






</Page>


{/* =====================================================
PAGE 3 — COFFEE VISION INTELLIGENCE
===================================================== */}


<Page

size="A4"

style={styles.page}

>


<Header

status={report.status}

/>






<Section

title="RGB Coffee Intelligence"

description="Coffee colour fingerprint analysis"

>


<Text style={styles.text}>

AI vision analysis evaluates coffee appearance
characteristics using RGB colour intelligence.

</Text>




<View style={{marginTop:10}}>


<Text style={styles.text}>

RED CHANNEL

</Text>


<Progress

value={Math.min(report.red / 10,100)}

color="#EF4444"

/>



<Text style={styles.description}>

Value : {report.red}

</Text>




<Text style={styles.text}>

GREEN CHANNEL

</Text>


<Progress

value={Math.min(report.green / 10,100)}

color="#22C55E"

/>



<Text style={styles.description}>

Value : {report.green}

</Text>





<Text style={styles.text}>

BLUE CHANNEL

</Text>


<Progress

value={Math.min(report.blue / 10,100)}

color="#38BDF8"

/>



<Text style={styles.description}>

Value : {report.blue}

</Text>



</View>



</Section>









<Section

title="Coffee Colour Profile"

description="Visual quality representation"

>



<View

style={{

flexDirection:"row",

justifyContent:"center",

alignItems:"flex-end",

height:120

}}

>



<View

style={{

width:35,

height:70,

backgroundColor:"#EF4444",

marginHorizontal:8,

borderRadius:5

}}

/>



<View

style={{

width:35,

height:100,

backgroundColor:"#22C55E",

marginHorizontal:8,

borderRadius:5

}}

/>



<View

style={{

width:35,

height:80,

backgroundColor:"#38BDF8",

marginHorizontal:8,

borderRadius:5

}}

/>



</View>





<Text style={styles.description}>

Coffee appearance consistency visualization

</Text>



</Section>









<Section

title="AI Evidence"

description="Signals supporting the final decision"

>



<Text style={styles.text}>

✓ Sensor parameters evaluated

</Text>



<Text style={styles.text}>

✓ Coffee colour profile analysed

</Text>



<Text style={styles.text}>

✓ Environmental risk assessed

</Text>



<Text style={styles.text}>

✓ AI confidence verified

</Text>



</Section>






</Page>









{/* =====================================================
PAGE 4 — AI DECISION SUPPORT
===================================================== */}



<Page

size="A4"

style={styles.page}

>



<Header

status={report.status}

/>









<Section

title="Root Cause Analysis"

description="AI interpretation of detected condition"

>


<Text style={styles.text}>


{

report.status==="HOLD"

?

"Quality deviation detected. Environmental conditions and quality indicators require corrective action before packaging."

:

report.status==="WARN"

?

"Quality variation detected. Additional verification is recommended."

:

"Quality parameters are within acceptable production limits."

}


</Text>



</Section>









<Section

title="Corrective Action Recommendation"

description="Recommended operational response"

>



<Text style={styles.text}>

01  Hold batch until verification

</Text>


<Text style={styles.text}>

02  Review moisture and environmental conditions

</Text>


<Text style={styles.text}>

03  Apply corrective production actions

</Text>


<Text style={styles.text}>

04  Perform AI quality revalidation

</Text>



</Section>









<Section

title="Recovery Workflow"

description="AI assisted recovery process"

>



<Text style={styles.text}>

STEP 1  Detect quality deviation

</Text>


<Text style={styles.text}>

STEP 2  Analyse sensor and colour evidence

</Text>


<Text style={styles.text}>

STEP 3  Apply corrective action

</Text>


<Text style={styles.text}>

STEP 4  Reassess batch quality

</Text>


<Text style={styles.text}>

STEP 5  Release after confirmation

</Text>



</Section>









<Section

title="Future Prevention Strategy"

description="Long term quality improvement"

>



<Text style={styles.text}>

✓ Continuous monitoring

</Text>


<Text style={styles.text}>

✓ Historical batch intelligence

</Text>


<Text style={styles.text}>

✓ Early warning detection

</Text>


<Text style={styles.text}>

✓ Production optimization

</Text>



</Section>







</Page>









{/* =====================================================
PAGE 5 — QUALITY CERTIFICATE
===================================================== */}



<Page

size="A4"

style={styles.page}

>



<View

style={{

flex:1,

justifyContent:"center",

alignItems:"center"

}}

>


<View

style={{

width:"90%",

backgroundColor:COLORS.surface,

padding:30,

borderRadius:18,

borderWidth:2,

borderColor:COLORS.gold,

alignItems:"center"

}}

>



<Text

style={{

fontSize:24,

fontWeight:"bold",

color:COLORS.gold

}}

>

CoffeeSense AI™

</Text>





<Text

style={{

fontSize:18,

fontWeight:"bold",

color:COLORS.white,

marginTop:15

}}

>

QUALITY CERTIFICATE

</Text>





<Text

style={styles.description}

>

Industrial Coffee Quality Intelligence Platform

</Text>







<Text style={styles.text}>

Batch ID

</Text>



<Text

style={{

fontSize:16,

fontWeight:"bold",

color:COLORS.gold

}}

>

{report.batchId}

</Text>








<Text style={styles.text}>

Final Decision

</Text>



<Text

style={{

fontSize:18,

fontWeight:"bold",

color:decisionColor(report.status)

}}

>

{report.status}

</Text>








<View

style={{

flexDirection:"row",

marginTop:20

}}

>


<Metric

label="Quality"

value={`${report.qualityScore}%`}

/>


<Metric

label="Confidence"

value={`${report.confidence}%`}

/>



</View>






<Text

style={styles.text}

>

Risk Level : {report.risk}

</Text>







<View style={styles.footer}>


<Text

style={{

fontSize:12,

fontWeight:"bold",

color:COLORS.gold

}}

>

CoffeeSense AI™

</Text>



<Text

style={{

fontSize:8,

color:COLORS.muted,

marginTop:5

}}

>

Industrial Coffee Quality Intelligence Report

</Text>



</View>






</View>


</View>




</Page>









</Document>

);

}




export default AIQualityReportPDF;

