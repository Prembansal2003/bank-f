import { useEffect,useState } from "react";
import Cookies from "universal-cookie"
import { http } from "../../modules/modules";
import { Navigate,Outlet } from "react-router-dom";
import Loader from "../Loader";
 
const Guard=({endpoint,role})=>{
    const cookie=new Cookies();
    const token=cookie.get("authToken");
    const [authorised ,setAuthorised]=useState(false);
    const [userType,setUserType]=useState(null);
    const [loader,setLoader]=useState(true);
    if(token==undefined){
        return <Navigate to="/"/>;
    }
    useEffect(()=>{
        const verifyToken=async()=>{
            if(!token){
                setAuthorised(false);
                return <Navigate to="/"/>
            }
            try{
                const httpreq=http(token);
                const {data}=await httpreq.get(endpoint);
                const user=data?.data?.userType;
                setUserType(user);
                sessionStorage.setItem("userInfo",JSON.stringify(data?.data));
                setAuthorised(true);
                setLoader(false);
            }
            catch(error){
                setAuthorised(false);
                setLoader(false);
                setUserType(null);

            }
        };
        verifyToken();
    },[endpoint]);

    if(loader){
        return <Loader/>;
    }

    if(authorised&&role==userType){
        return <Outlet/>;
    }
    else{
        return <Navigate to="/"/>;
    }
}
export default Guard;