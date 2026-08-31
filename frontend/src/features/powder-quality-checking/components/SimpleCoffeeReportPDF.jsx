import {
    Document,
    Page,
    Text,
    View,
    StyleSheet
} from "@react-pdf/renderer";


const styles = StyleSheet.create({

page:{
    padding:40,
    fontSize:12
},


title:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
},


section:{
    marginBottom:15,
    padding:10,
    borderBottom:"1 solid #cccccc"
},


heading:{
    fontSize:14,
    fontWeight:"bold",
    marginBottom:8
},


text:{
    fontSize:11,
    marginBottom:5
}


});





export default function SimpleCoffeeReportPDF({
    data={}
}){


const ai = data.ai_decision || {};



return (

<Document>


<Page 
size="A4"
style={styles.page}
>


<Text style={styles.title}>
CoffeeSense AI Report
</Text>



<View style={styles.section}>

<Text style={styles.heading}>
Batch Information
</Text>


<Text style={styles.text}>
Batch ID : {data.batch_id || "N/A"}
</Text>


</View>





<View style={styles.section}>


<Text style={styles.heading}>
AI Decision
</Text>


<Text style={styles.text}>
Decision : {ai.decision || "N/A"}
</Text>


<Text style={styles.text}>
Confidence : {ai.confidence || 0}%
</Text>


<Text style={styles.text}>
Risk Level : {ai.risk_level || "N/A"}
</Text>


</View>





<View style={styles.section}>


<Text style={styles.heading}>
Sensor Information
</Text>


<Text style={styles.text}>
Moisture : {data.moisture ?? "N/A"}
</Text>


<Text style={styles.text}>
Humidity : {data.humidity ?? "N/A"} %
</Text>


<Text style={styles.text}>
Temperature : {data.temperature ?? "N/A"} °C
</Text>


</View>





<View style={styles.section}>


<Text style={styles.heading}>
Quality Summary
</Text>


<Text style={styles.text}>
Condition Score : {data.condition_score ?? 0}%
</Text>


</View>





</Page>


</Document>


);


}