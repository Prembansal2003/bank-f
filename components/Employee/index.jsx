import useSWR from 'swr';
import Employeelayout from '../Layout/Employeelayout'
import Dashboard from '../Shared/Dashboard';
import { fetchData } from '../../modules/modules';
const EmployeeDashboard=()=>{
     const userInfo=JSON.parse(sessionStorage.getItem("userInfo"));
    const {data:trData,error:trError}=useSWR(`/api/transaction/summary?branch=${userInfo.branch}`,fetchData,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
        refreshInterval:120000
    })
    return (
        <Employeelayout >
            <Dashboard data={trData&&trData}/>
        </Employeelayout>
    )
};
export default EmployeeDashboard; 