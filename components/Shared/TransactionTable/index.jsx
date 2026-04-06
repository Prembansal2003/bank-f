import React, { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, Table } from "antd";
import { formatDate, http, printBankTransactions, trim, downloadTransaction } from "../../../modules/modules";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import Cookies from "universal-cookie";

const {Item}=Form;
const TransactionTable = ({ query = {} }) => {
  const cookie = new Cookies();
  const token = cookie.get("authToken");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [accountNo, setAccountNo] = useState(query.accountNo || "");
  const [branch, setBranch] = useState(query.branch || "");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      values.branch = query.branch;
      if (query.isCustomer) values.accountNo = query.accountNo;
      // Use local date string (YYYY-MM-DD) to avoid UTC timezone offset shifting the date
      values.fromDate = values.fromDate?.format('YYYY-MM-DD');
      values.toDate = values.toDate?.format('YYYY-MM-DD');
      const httpreq = http(token);
      let obj = trim(values);
      const { data } = await httpreq.post(`/api/transaction/filter`, obj);
      setData(data);
    }
    catch (err) {
      console.error("Filter failed", err);
    }
  };

  const fetchTransactions = async (params = {}) => {
    setLoading(true);
    const searchParams = new URLSearchParams({
      page: params.current || 1,
      pageSize: params.pageSize || 10,
    });

    if (accountNo) searchParams.append("accountNo", accountNo);
    if (branch) searchParams.append("branch", branch);
    try {
      const httpReq = http(token);
      const res = await httpReq.get(`/api/transaction/pagination?${searchParams.toString()}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setPagination({
        current: res.data.page,
        pageSize: res.data.pageSize
      });
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(pagination);
  }, [query]);

  const handleTableChange = (pagination) => {
    fetchTransactions(pagination);
  };

  const columns = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo"
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch"
    },
    {
      title: "Type",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (t) => (
        <span className={t === "cr" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
          {t?.toUpperCase()}
        </span>
      )
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c) => <span className="capitalize">{c}</span>
    },
    {
      title: "Amount",
      dataIndex: "transactionAmount",
      key: "transactionAmount"
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (n) => n || "—"
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d)
    },
  ];

  return (
    <div className="p-4">
      <Card className="!mb-2">
        <div className="flex justify-between items-center">
          <Form className="flex gap-3" onFinish={onFinish}>
            <Item label="From" name="fromDate" rules={[{ required: true }]}>
              <DatePicker />
            </Item>
            <Item label="To" name="toDate" rules={[{ required: true }]}>
              <DatePicker />
            </Item>
            {
              !query.isCustomer &&
              <Item label="Account" name="accountNo">
                <Input placeholder="Account No" />
              </Item>
            }
            <Item>
              <Button type="text" htmlType="submit" className="!font-semibold !text-white !bg-blue-500">
                Fetch Transactions
              </Button>
            </Item>
          </Form>
          <div className="flex gap-2">
            <Button type="text" className="!font-semibold !text-white !bg-green-500" shape="circle" icon={<DownloadOutlined />} onClick={() => downloadTransaction(data)} />
            <Button type="text" className="!font-semibold !text-white !bg-blue-500" shape="circle" icon={<PrinterOutlined />} onClick={() => printBankTransactions(data)} />
          </div>
        </div>
      </Card>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        pagination={{
          total: total,
          current: pagination.current,
          pageSize: pagination.pageSize
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default TransactionTable;
