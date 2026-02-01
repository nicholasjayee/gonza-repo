"use client";


import { useState, useEffect } from "react";
import { getTransactionsAction } from "@/app/sales/actions";

export const useCashTransactions = () => {
  const [transactions, setTransactions] = useState<{ id: string; accountId: string }[]>([]); // simplified type
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     const fetchTx = async () => {
        setLoading(true);
        const res = await getTransactionsAction();
        if (res.success && res.data) {
           // Map to expected shim type
           setTransactions(res.data.map((t: { id: string }) => ({ id: t.id, accountId: "default" })));
        }
        setLoading(false);
     };
     fetchTx();
  }, []);

  return {
    transactions,
    loading,
    refresh: () => {},
  };
};
