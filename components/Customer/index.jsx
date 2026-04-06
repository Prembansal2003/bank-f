import useSWR from "swr";
import Customerlayout from "../Layout/Customerlayout";
import Dashboard from "../Shared/Dashboard";
import { fetchData } from "../../modules/modules";

const CustomerDashboard=()=>{
        const userInfo=JSON.parse(sessionStorage.getItem("userInfo"));

    const {data:trData,error:trError}=useSWR(`/api/transaction/summary?accountNo=${userInfo.accountNo}`,fetchData,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
        refreshInterval:120000
    })
    return (
        <Customerlayout>
<Dashboard data={trData}/>        </Customerlayout>
    )
}
export default CustomerDashboard;
