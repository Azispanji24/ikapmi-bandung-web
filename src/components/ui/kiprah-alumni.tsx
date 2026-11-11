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
];

export function KiprahAlumniSection() {
  return (
    <section
      id="kiprah"
      className="scroll-mt-20 sm:scroll-mt-24 relative w-full overflow-hidden bg-[#081326] py-16 md:py-24 text-white border-b border-blue-950/80"
    >
      {/* Decorative subtle curved stroke */}
      <div aria-hidden="true">
        <svg
          className="pointer-events-none absolute right-0 bottom-0 text-white/[0.06]"
          fill="none"
          height="154"
          viewBox="0 0 460 154"
          width="460"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_kiprah_bg)">
            <path
              d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="40"
            />
          </g>
          <defs>
            <clipPath id="clip0_kiprah_bg">
              <rect fill="white" height="154" width="460" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-14 sm:mb-16 flex max-w-5xl flex-col items-center px-6 text-center lg:px-0">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
              <path d="M8 15H7a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
            </svg>
          </div>

          <h2 className="relative mb-4 font-bold text-3xl text-white tracking-tight sm:text-5xl">
            Kiprah Alumni
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 -right-8 -z-10 w-24 text-white/10"
              fill="currentColor"
              height="86"
              viewBox="0 0 108 86"
              width="108"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M38.8484 16.236L15 43.5793L78.2688 15L18.1218 71L93 34.1172L70.2047 65.2739"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="28"
              />
            </svg>
          </h2>
          <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
            Mengenal tokoh dan senior alumni Pondok Pesantren Modern Ummul Quro
            Al-Islami yang berkiprah aktif sebagai akademisi, praktisi, maupun
            penggerak di masyarakat.
          </p>
        </div>

        {/* Continuous Horizontal Marquee */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-16 sm:w-32 bg-gradient-to-r from-[#081326] to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-16 sm:w-32 bg-gradient-to-l from-[#081326] to-transparent" />

          <Marquee className="[--gap:1.5rem] [--duration:26s]" pauseOnHover repeat={4}>
            {KIPRAH_ALUMNI.map((member) => (
              <div
                className="group flex w-64 shrink-0 flex-col"
                key={member.name}
              >
                <div className="relative h-[23rem] w-full overflow-hidden rounded-2xl bg-[#0d1f3c] border border-white/10 shadow-xl">
                  <img
                    alt={member.name}
                    className="h-full w-full object-cover object-top grayscale transition-all duration-300 group-hover:grayscale-0"
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
                Sadulur Ngahiji · Tatar Pasundan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
