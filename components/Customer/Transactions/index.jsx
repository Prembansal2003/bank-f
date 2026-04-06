import Customerlayout from "../../Layout/Customerlayout";
import TransactionTable from "../../Shared/TransactionTable";

const CustomerTransactions=()=>{
        const userInfo=JSON.parse(sessionStorage.getItem("userInfo"));

    return (
        <Customerlayout>
                    <TransactionTable query={{accountNo:userInfo?.accountNo,branch:userInfo?.branch,isCustomer:true}}/>

        </Customerlayout>
    )
}
export default CustomerTransactions;