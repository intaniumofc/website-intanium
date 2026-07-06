'use client';

import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock5,
  ScanSearch,
  TriangleAlert,
} from "lucide-react";
import React from "react";

export const StatusBadge = ({
  status,
  customLabel,
  className = "",
}) => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "pending_review":
    case "in_review":
    case "in review":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-yellow-50 rounded-xl ${className}`}>
          <span className="flex items-center text-[#F0B13D] font-bold text-xs">
            <ScanSearch className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "In Review"}
          </span>
        </div>
      );
    case "pending":
    case "waiting_payment":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-orange-50 rounded-xl ${className}`}>
          <span className="flex items-center text-[#EAA65D] font-bold text-xs">
            <TriangleAlert className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "Pending"}
          </span>
        </div>
      );
    case "failed":
    case "cancelled":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-rose-50 rounded-xl ${className}`}>
          <span className="flex items-center text-[#D57463] font-bold text-xs">
            <CircleX className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "cancelled" ? "Dibatalkan" : "Failed")}
          </span>
        </div>
      );
    case "success":
    case "completed":
    case "ready_for_pickup":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-emerald-50 rounded-xl ${className}`}>
          <span className="flex items-center text-[#57BC6C] font-bold text-xs">
            <CircleCheck className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "ready_for_pickup" ? "Siap Diambil" : "Selesai")}
          </span>
        </div>
      );
    case "in_progress":
    case "in progress":
    case "processing":
    case "shipped":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-sky-100 rounded-xl ${className}`}>
          <span className="flex items-center text-[#008AF5] font-bold text-xs">
            <CircleDashed className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "shipped" ? "Dalam Pengiriman" : "In Progress")}
          </span>
        </div>
      );
    case "expired":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-zinc-100 rounded-xl ${className}`}>
          <span className="flex items-center text-[#777777] font-bold text-xs">
            <Clock5 className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "Expired"}
          </span>
        </div>
      );
    case "submitted":
    case "paid":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-violet-50 rounded-xl ${className}`}>
          <span className="flex items-center text-[#6C3CF0] font-bold text-xs">
            <Clock5 className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "paid" ? "Pembayaran Terverifikasi" : "Submitted")}
          </span>
        </div>
      );
    default:
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-slate-50 rounded-xl ${className}`}>
          <span className="flex items-center text-slate-500 font-bold text-xs">
            {customLabel || status}
          </span>
        </div>
      );
  }
};

const StatusDemo = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="w-40 h-[35px] flex items-center justify-center bg-orange-50 rounded-xl ">
          <h1 className="flex items-center  text-[#EAA65D] font-semibold">
            <TriangleAlert className="w-4 h-4 mr-2" strokeWidth={3} />
            Pending
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-rose-50 rounded-xl ">
          <h1 className="flex items-center  text-[#D57463] font-semibold">
            <CircleX className="w-4 h-4 mr-2" strokeWidth={3} />
            Failed
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div className="w-40 h-[35px] flex items-center justify-center bg-emerald-50 rounded-xl ">
          <h1 className="flex items-center  text-[#57BC6C] font-semibold">
            <CircleCheck className="w-4 h-4 mr-2" strokeWidth={3} />
            Success
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-sky-100 rounded-xl ">
          <h1 className="flex items-center  text-[#008AF5] font-semibold">
            <CircleDashed className="w-4 h-4 mr-2" strokeWidth={3} />
            In progress
          </h1>
        </div>{" "}
        <div className="w-40 h-[35px] flex items-center justify-center bg-yellow-50 rounded-xl ">
          <h1 className="flex items-center  text-[#F0B13D] font-semibold">
            <ScanSearch className="w-4 h-4 mr-2" strokeWidth={3} />
            In review
          </h1>
        </div>{" "}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-40 h-[35px] flex items-center justify-center bg-zinc-100 rounded-xl ">
          <h1 className="flex items-center  text-[#777777] font-semibold">
            <Clock5 className="w-4 h-4 mr-2" strokeWidth={3} />
            Expired
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-violet-50 rounded-xl ">
          <h1 className="flex items-center  text-[#6C3CF0] font-semibold">
            <Clock5 className="w-4 h-4 mr-2" strokeWidth={3} />
            Submited
          </h1>
        </div>
      </div>
    </div>
  );
};

export default StatusDemo;
