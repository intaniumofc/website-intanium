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
    // In Review → IRIS Yellow (optimism / review pending)
    case "pending_review":
    case "in_review":
    case "in review":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-yellow-tint-15)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-iris-yellow-dark)] font-bold text-xs">
            <ScanSearch className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "In Review"}
          </span>
        </div>
      );
    // Pending → IRIS Peach (warmth / soft alert)
    case "pending":
    case "waiting_payment":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-peach-tint-15)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-iris-peach-dark)] font-bold text-xs">
            <TriangleAlert className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "Pending"}
          </span>
        </div>
      );
    // Failed → IRIS-toned danger
    case "failed":
    case "cancelled":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-pink-tint-12)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-error)] font-bold text-xs">
            <CircleX className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "cancelled" ? "Dibatalkan" : "Failed")}
          </span>
        </div>
      );
    // Success → IRIS Mint (freshness / success)
    case "success":
    case "completed":
    case "ready_for_pickup":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-mint-tint-15)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-iris-mint-dark)] font-bold text-xs">
            <CircleCheck className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "ready_for_pickup" ? "Siap Diambil" : "Selesai")}
          </span>
        </div>
      );
    // In Progress → IRIS Blue (trust / info)
    case "in_progress":
    case "in progress":
    case "processing":
    case "shipped":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-blue-tint-15)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-iris-blue-dark)] font-bold text-xs">
            <CircleDashed className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "shipped" ? "Dalam Pengiriman" : "In Progress")}
          </span>
        </div>
      );
    // Expired → neutral
    case "expired":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--bg-secondary)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--text-secondary)] font-bold text-xs">
            <Clock5 className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || "Expired"}
          </span>
        </div>
      );
    // Submitted / Paid → IRIS Purple (creativity)
    case "submitted":
    case "paid":
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--color-purple-tint-12)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--color-iris-purple-dark)] font-bold text-xs">
            <Clock5 className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={3} />
            {customLabel || (normalizedStatus === "paid" ? "Pembayaran Terverifikasi" : "Submitted")}
          </span>
        </div>
      );
    default:
      return (
        <div className={`w-fit min-w-[100px] h-[35px] px-3.5 inline-flex items-center justify-center bg-[var(--bg-secondary)] rounded-xl ${className}`}>
          <span className="flex items-center text-[var(--text-secondary)] font-bold text-xs">
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
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-peach-tint-15)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-iris-peach-dark)] font-semibold">
            <TriangleAlert className="w-4 h-4 mr-2" strokeWidth={3} />
            Pending
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-pink-tint-12)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-error)] font-semibold">
            <CircleX className="w-4 h-4 mr-2" strokeWidth={3} />
            Failed
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-mint-tint-15)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-iris-mint-dark)] font-semibold">
            <CircleCheck className="w-4 h-4 mr-2" strokeWidth={3} />
            Success
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-blue-tint-15)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-iris-blue-dark)] font-semibold">
            <CircleDashed className="w-4 h-4 mr-2" strokeWidth={3} />
            In progress
          </h1>
        </div>{" "}
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-yellow-tint-15)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-iris-yellow-dark)] font-semibold">
            <ScanSearch className="w-4 h-4 mr-2" strokeWidth={3} />
            In review
          </h1>
        </div>{" "}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--bg-secondary)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--text-secondary)] font-semibold">
            <Clock5 className="w-4 h-4 mr-2" strokeWidth={3} />
            Expired
          </h1>
        </div>
        <div className="w-40 h-[35px] flex items-center justify-center bg-[var(--color-purple-tint-12)] rounded-xl ">
          <h1 className="flex items-center  text-[var(--color-iris-purple-dark)] font-semibold">
            <Clock5 className="w-4 h-4 mr-2" strokeWidth={3} />
            Submited
          </h1>
        </div>
      </div>
    </div>
  );
};

export default StatusDemo;
