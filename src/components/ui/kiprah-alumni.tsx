import * as React from "react";
import { Marquee } from "./marquee";

export interface AlumnusProfile {
  image: string;
  name: string;
  batch: string;
  role: string;
}

const KIPRAH_ALUMNI: AlumnusProfile[] = [
  {
    image: "assets/kiprah/rizzaldy-satria-wiwaha.jpg",
    name: "Dr. Rizzaldy Satria Wiwaha",
    batch: "Angkatan 9 PMUQI",
    role: "Dosen UIN SGD Bandung",
  },
  {
    image: "assets/kiprah/pipit-sugiarto.jpg",
    name: "Pipit Sugiarto, M.Pd.",
    batch: "Angkatan 9 PMUQI",
    role: "Dosen UIN SGD Bandung",
  },
  {
    image: "assets/kiprah/ahmad-zaeni-dahlan.jpg",
    name: "Ust. Ahmad Zaeni Dahlan, M.Pd.",
    batch: "Angkatan 9 PMUQI",
    role: "Dosen UIN SGD Bandung",
  },
  {
    image: "assets/kiprah/yeyen.jpeg",
    name: "Yeyen Hamidah, M.Pd.",
    batch: "Angkatan 8 PMUQI",
    role: "Dosen Telkom University",
  },
  {
    image: "assets/kiprah/diki.jpeg",
    name: "Diki Andriana",
    batch: "Angkatan 12 PMUQI",
    role: "Kepala Kantor DPC PKB Kab. Bandung",
  },
];

export function KiprahAlumniSection() {
  return (
    <section
      id="kiprah"
      className="scroll-mt-20 sm:scroll-mt-24 relative w-full overflow-hidden py-16 sm:py-24 text-white border-b border-blue-950/80"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-10 sm:mb-12 flex max-w-5xl flex-col items-center px-6 text-center lg:px-0">
          <h2 className="mb-4 font-extrabold text-2xl text-white tracking-tight leading-snug sm:text-4xl">
            Kiprah Alumni
          </h2>
          <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
            Mengenal tokoh dan senior alumni Pesantren Modern Ummul Quro
            Al-Islami yang berkiprah aktif sebagai akademisi, praktisi, maupun
            penggerak di masyarakat.
          </p>
        </div>

        {/* Continuous Horizontal Marquee */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-16 sm:w-32 bg-gradient-to-r from-[#081326] to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-16 sm:w-32 bg-gradient-to-l from-[#081326] to-transparent" />

          <Marquee className="[--gap:1.5rem] [--duration:16s]" pauseOnHover repeat={4}>
            {KIPRAH_ALUMNI.map((member) => (
              <div
                className="group flex w-64 shrink-0 flex-col"
                key={member.name}
              >
                <div className="relative h-[23rem] w-full overflow-hidden rounded-2xl bg-[#0d1f3c] border border-white/10 shadow-xl">
                  <img
                    alt={member.name}
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      member.name.includes("Yeyen") ? "object-center" : "object-top"
                    }`}
                    src={member.image}
                  />
                  <div className="absolute bottom-0 w-full rounded-lg bg-white/90 backdrop-blur-sm p-3 text-left">
                    <h3 className="font-semibold text-sm text-neutral-900 leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-neutral-700 text-xs mt-0.5 leading-snug">
                      {member.role}
                    </p>
                    <p className="text-[#0f2e59] text-[11px] font-semibold mt-1">
                      {member.batch}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Closing Statement */}
        <div className="mx-auto mt-16 sm:mt-20 max-w-3xl px-6 text-center lg:px-0">
          <p className="mb-8 font-medium text-lg text-white leading-relaxed md:text-xl">
            Dari pesantren menuju pengabdian nyata di dunia keilmuan dan
            masyarakat. Jejak kiprah para alumni menjadi inspirasi bagi generasi
            santri perantau di Bandung Raya.
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/20">
              <img
                alt="IKAPMI Regional Bandung"
                className="h-full w-full object-cover"
                src="assets/ikapmi_logo.jpg"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">
                IKAPMI Regional Bandung
              </p>
              <p className="text-slate-300 text-sm">
                Sadulur Ngahiji di Bhumi Parahyangan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
