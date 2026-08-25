import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";


const RefreshContext = createContext();



export function RefreshProvider({children}){


const [autoRefresh,setAutoRefresh] = useState(true);


const [refreshSignal,setRefreshSignal] = useState(0);





useEffect(()=>{


if(!autoRefresh)
    return;



const timer = setInterval(()=>{


setRefreshSignal(
    prev=>prev+1
);


},60000);



return ()=>clearInterval(timer);



},[autoRefresh]);







return (

<RefreshContext.Provider

value={{

autoRefresh,

setAutoRefresh,

refreshSignal


}}

>


{children}


</RefreshContext.Provider>


)



}





export function useRefresh(){


return useContext(
    RefreshContext
);


}