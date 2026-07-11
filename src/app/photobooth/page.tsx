import React from "react";
import { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import PhotoboothStudio from "./components/PhotoboothStudio";

export const metadata: Metadata = {
  title: "Studio Foto Online Intanium - Cekrek Bareng Intan!",
  description: "Ambil 4 pose foto berurutan menggunakan webcam Anda, lalu susun secara otomatis ke dalam bingkai photostrip bertema Intanium eksklusif Nur Intan JKT48.",
  keywords: ["intanium", "nur intan", "jkt48", "photobooth online", "studio foto", "photostrip online"],
  openGraph: {
    title: "Studio Foto Online Intanium - Cekrek Bareng Intan!",
    description: "Ambil 4 pose foto berurutan menggunakan webcam Anda, lalu susun secara otomatis ke dalam bingkai photostrip bertema Intanium eksklusif Nur Intan JKT48.",
    type: "website",
    url: "https://intanium.com/photobooth",
    images: [
      {
        url: "/assets/frames/frame-classic.png",
        width: 1686,
        height: 2528,
        alt: "Studio Foto Online Intanium"
      }
    ]
  }
};

const Layout = (MainLayout as unknown) as React.ComponentType<{ children: React.ReactNode; isHome?: boolean }>;

export default function PhotoboothPage() {
  return (
    <Layout>
      <PhotoboothStudio />
    </Layout>
  );
}
