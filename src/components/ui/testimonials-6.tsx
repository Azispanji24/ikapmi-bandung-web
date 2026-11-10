"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquarePlus,
  X,
  Send,
  Heart,
  CheckCircle2,
  Sparkles,
  Camera,
  Trash2,
} from "lucide-react";

export type Testimonial = {
  quote: string;
  image: string;
  name: string;
  role: string;
  company?: string;
  date?: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Pertama kali nginjek kaki di Bandung sempat bingung arah dan cari kosan. Untung ketemu pengurus IKAPMI, langsung diarahkan dan dibantu sampe tuntas. Solidaritasnya luar biasa!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Ahmad Fauzan",
    role: "Teknik Elektro '22",
    company: "ITB Bandung",
    date: "Baru saja",
  },
  {
    quote:
      "IKAPMI Bandung bukan sekadar organisasi alumni daerah, tapi rumah kedua di perantauan. Dari kajian santri, makrab, sampe bimbingan skripsi selalu ada yang dampingi.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    name: "Nabila Zahra",
    role: "Hukum Tata Negara '21",
    company: "UIN SGD Bandung",
    date: "1 hari yang lalu",
  },
  {
    quote:
      "Jejaring santri di Bandung ngebantu banget buat magang dan riset tugas akhir. Banyak senior IKAPMI yang udah kerja dan loyal banget sharing peluang karir.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Rifqi Al-Fatih",
    role: "Informatika '20",
    company: "Telkom University",
    date: "2 hari yang lalu",
  },
  {
    quote:
      "Bagi santri baru yang belum terbiasa dengan dinginnya Bandung dan ritme kuliah kampus negeri, IKAPMI punya panduan ospek dan adaptasi yang super komprehensif!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    name: "Salma Putri",
    role: "Farmasi '23",
    company: "UNPAD Jatinangor",
    date: "3 hari yang lalu",
  },
  {
    quote:
      "Kegiatan Sadulur Ngahiji bikin kita ga pernah ngerasa kesepian di kota rantau. Makan liwet bareng, ngobrol santai, nambah sodara dari satu pondok.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "Habiburrahman",
    role: "Pendidikan Bahasa Arab '21",
    company: "UPI Bumi Siliwangi",
    date: "4 hari yang lalu",
  },
  {
    quote:
      "Website IKAPMI Bandung sekarang keren banget, modern dan interaktif! Ada panduan santri baru, struktur kepengurusan, dan galeri kenangan kegiatan kita bersama.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    name: "Fathimah Az-Zahra",
    role: "Akuntansi Syariah '22",
    company: "Unisba Bandung",
    date: "5 hari yang lalu",
  },
  {
    quote:
      "Mureg dan Raker IKAPMI selalu menghasilkan program kerja yang berdampak nyata buat santri. Senang bisa terus berkontribusi di perantauan kota kembang.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    name: "Dimas Suryo",
    role: "Teknik Kimia '19",
    company: "POLBAN (Alumni)",
    date: "1 minggu yang lalu",
  },
  {
    quote:
      "Tetap jaga marwah santri di manapun kuliahnya. Nilai kesederhanaan dan ketakziman yang diajarkan di pondok terbukti jadi pondasi sukses di dunia akademis.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    name: "M. Azis Panji",
    role: "Ketua Umum",
    company: "IKAPMI Bandung",
    date: "2 minggu yang lalu",
  },
  {
    quote:
      "Buat adik-adik santri yang baru lulus dan mau lanjut studi ke Bandung: jangan ragu! Komunitas IKAPMI siap menyambut hangat dari terminal/stasiun sampe gerbang kampus.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    name: "Annisa Rahmadani",
    role: "Desain Komunikasi Visual '22",
    company: "ISBI Bandung",
    date: "2 minggu yang lalu",
  },
];

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
];

const LOCAL_STORAGE_KEY = "ikapmi_testimonials_v1";

/**
 * Resize and center-crop uploaded photo to crisp 200x200 square.
 * This guarantees ultra-sharp avatars while keeping data footprint ~15KB.
 */
function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal mengunggah file"));
    reader.readAsDataURL(file);
  });
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formRole, setFormRole] = React.useState("");
  const [formCompany, setFormCompany] = React.useState("ITB Bandung");
  const [formQuote, setFormQuote] = React.useState("");
  const [selectedAvatar, setSelectedAvatar] = React.useState(AVATAR_OPTIONS[0]);
  const [isCustomUploaded, setIsCustomUploaded] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Load from localStorage or defaults
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setTestimonials(DEFAULT_TESTIMONIALS);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Harap pilih file gambar (JPG, PNG, atau WEBP).");
      return;
    }

    try {
      setUploadError(null);
      const compressed = await compressAvatar(file);
      setSelectedAvatar(compressed);
      setIsCustomUploaded(true);
    } catch (err: any) {
      setUploadError(err?.message || "Gagal memproses gambar.");
    }
  };

  const handleResetAvatar = () => {
    setSelectedAvatar(AVATAR_OPTIONS[0]);
    setIsCustomUploaded(false);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formQuote.trim()) return;

    const newTestimonial: Testimonial = {
      name: formName.trim(),
      role: formRole.trim() || "Santri Perantau",
      company: formCompany.trim() || "Bandung",
      quote: formQuote.trim(),
      image: selectedAvatar,
      date: "Baru saja",
    };

    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage issues
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setFormName("");
      setFormRole("");
      setFormQuote("");
      setSelectedAvatar(AVATAR_OPTIONS[0]);
      setIsCustomUploaded(false);
    }, 1500);
  };

  // Divide into 3 columns
  const firstColumn = testimonials.filter((_, idx) => idx % 3 === 0);
  const secondColumn = testimonials.filter((_, idx) => idx % 3 === 1);
  const thirdColumn = testimonials.filter((_, idx) => idx % 3 === 2);

  return (
    <section id="ulasan-wall" className="relative py-16 sm:py-24 bg-white overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-50/70 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Section Matching 21st.dev testimonials-6 */}
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50/80 px-4 py-1 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Suara Santri & Ulasan Alumni</span>
            </div>
          </div>

          <h2 className="font-bold text-3xl tracking-tighter text-slate-900 sm:text-4xl lg:text-5xl">
            Cerita & Sapaan Rantau
          </h2>
          <p className="text-center text-slate-500 text-sm sm:text-base leading-relaxed">
            Dengar langsung pengalaman para santri IKAPMI yang menuntut ilmu di berbagai perguruan tinggi negeri & swasta se-Bandung Raya.
          </p>

          {/* Zero-Cost Interactive Trigger Button */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Tulis Ulasan / Sapa Santri</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">
              • Bisa upload foto profil bebas (Gratis 100%)
            </span>
          </div>
        </div>

        {/* 3-Column Infinite Vertical Slider with Gradient Mask */}
        <div
          className={cn(
            "mt-12 flex h-[580px] max-h-[640px] justify-center gap-6 overflow-hidden",
            "mask-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]",
          )}
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          {/* Column 1 (All screens) */}
          <InfiniteSlider direction="vertical" speed={32} speedOnHover={15} gap={20}>
            {firstColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>

          {/* Column 2 (md and up) */}
          <InfiniteSlider
            className="hidden md:block"
            direction="vertical"
            speed={48}
            speedOnHover={20}
            gap={20}
          >
            {secondColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>

          {/* Column 3 (lg and up) */}
          <InfiniteSlider
            className="hidden lg:block"
            direction="vertical"
            speed={38}
            speedOnHover={18}
            gap={20}
          >
            {thirdColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>

      {/* Modal / Dialog Tulis Ulasan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Alhamdulillah!</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ulasan dan foto kamu telah berhasil disematkan dan tampil langsung di dinding suara santri IKAPMI Bandung.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1 text-brand-600">
                  <Heart className="w-4 h-4 fill-brand-600" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Sapaan Alumni & Santri</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tulis Ulasan / Sapaan</h3>
                <p className="text-xs text-slate-500 mt-1 mb-5">
                  Bagikan kesanmu di IKAPMI Bandung, sapa teman seperjuangan, atau beri semangat untuk santri baru.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Avatar Upload / Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Foto Profil / Avatar Bebas:
                    </label>

                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                      {/* Avatar Preview */}
                      <div className="relative size-14 rounded-full overflow-hidden ring-2 ring-brand-500 shadow-sm shrink-0 bg-white">
                        <img
                          src={selectedAvatar}
                          alt="Preview Foto"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Upload Actions */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="avatar-file-input"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium text-xs shadow-sm transition"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isCustomUploaded ? "Ganti Foto Anda" : "Unggah Foto Bebas"}</span>
                          </label>
                          <input
                            id="avatar-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />

                          {isCustomUploaded && (
                            <button
                              type="button"
                              onClick={handleResetAvatar}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Reset ke avatar preset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Pilih foto dari galeri HP atau laptop. Otomatis dipotong bulat dan dioptimasi.
                        </p>
                        {uploadError && (
                          <p className="text-[11px] text-rose-500 font-medium mt-0.5">
                            {uploadError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preset Avatars Row */}
                    <div className="mt-2.5">
                      <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                        Atau pilih avatar siap pakai:
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {AVATAR_OPTIONS.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(imgUrl);
                              setIsCustomUploaded(false);
                              setUploadError(null);
                            }}
                            className={cn(
                              "relative size-9 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                              selectedAvatar === imgUrl && !isCustomUploaded
                                ? "border-brand-600 scale-110 shadow-sm ring-2 ring-brand-200"
                                : "border-transparent opacity-65 hover:opacity-100"
                            )}
                            title={`Pilih avatar ${idx + 1}`}
                          >
                            <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap / Panggilan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Fikri Al-Ghifari"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
                    />
                  </div>

                  {/* Kampus & Jurusan / Angkatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jurusan & Angkatan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Teknik Mesin '23"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kampus / Lembaga
                      </label>
                      <select
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition bg-white"
                      >
                        <option value="ITB Bandung">ITB Bandung</option>
                        <option value="UNPAD Jatinangor">UNPAD Jatinangor</option>
                        <option value="UPI Bumi Siliwangi">UPI Bumi Siliwangi</option>
                        <option value="UIN Sunan Gunung Djati">UIN SGD Bandung</option>
                        <option value="Telkom University">Telkom University</option>
                        <option value="POLBAN Bandung">POLBAN Bandung</option>
                        <option value="Unisba Bandung">Unisba Bandung</option>
                        <option value="ISBI Bandung">ISBI Bandung</option>
                        <option value="Alumni IKAPMI">Alumni IKAPMI</option>
                        <option value="Santri Bandung">Lainnya / Umum</option>
                      </select>
                    </div>
                  </div>

                  {/* Pesan / Ulasan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pesan / Cerita / Ulasan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Bagikan pengalamanmu, tips kuliah di Bandung, atau doa untuk sesama santri..."
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Ulasan</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, image, name, role, company, date } = testimonial;
  return (
    <figure
      className={cn(
        "w-full max-w-xs rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition-all dark:bg-card/20",
        className,
      )}
      {...props}
    >
      <blockquote className="text-slate-700 text-sm leading-relaxed font-normal">
        "{quote}"
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 pt-3 border-t border-slate-100">
        <Avatar className="size-9 rounded-full ring-2 ring-brand-100/80 shrink-0">
          <AvatarImage alt={`${name}'s profile picture`} src={image} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <cite className="font-semibold text-slate-900 not-italic text-sm leading-5 tracking-tight truncate">
              {name}
            </cite>
          </div>
          <span className="text-slate-500 text-xs leading-4 tracking-tight truncate">
            {role} {company && `• ${company}`}
          </span>
          {date && (
            <span className="text-[10px] text-slate-400 mt-0.5">
              {date}
            </span>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;
