import Adminlayout from "../../Layout/Adminlayout";

import NewTransaction from "../../Shared/NewTransaction";

import TransactionTable from "../../Shared/TransactionTable"; 
const AdminTransaction=()=>{

        const userInfo=JSON.parse(sessionStorage.getItem("userInfo"));  
    return(

        <Adminlayout>

            <NewTransaction/>

                        <TransactionTable query={{branch:userInfo?.branch}}/> </Adminlayout> 

    )}
export default AdminTransaction;

