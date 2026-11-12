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
  Camera,
  Trash2,
  Cloud,
  RefreshCw,
  User,
} from "lucide-react";

export type Testimonial = {
  quote: string;
  image: string;
  name: string;
  role: string;
  company?: string;
  date?: string;
};

// URL Default Google Apps Script Resmi Terhubung ke Google Sheet IKAPMI (100% Gratis Selamanya)
export const DEFAULT_CLOUD_API_URL =
  "https://script.google.com/macros/s/AKfycbwUxVCFgFcPPaMwwJJisWoVlNnmXC0_iW7xJGOESROCUBAvYklT6DQDNZeKJLcFWB1z/exec";

const LOCAL_STORAGE_KEY = "ikapmi_testimonials_v4";
const CLOUD_URL_STORAGE_KEY = "ikapmi_cloud_api_url_v1";

function getInitials(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isValidTestimonial(item: any): boolean {
  if (!item || !item.name || !item.quote) return false;
  const name = String(item.name).trim().toLowerCase();
  const quote = String(item.quote).trim().toLowerCase();

  // Filter out test/dummy/removed accounts
  if (
    name === "cpntph" ||
    name === "contoh" ||
    name === "m. azis panji" ||
    name === "fulan" ||
    name.includes("haji qodir") ||
    name === "qodir"
  ) {
    return false;
  }

  // Filter out test/spam quotes
  if (
    quote.includes("alhamdulillah database ulasan") ||
    quote === "aaaaaa" ||
    quote === "adasdas" ||
    quote === "sss"
  ) {
    return false;
  }

  return true;
}

/**
 * Resize and center-crop uploaded photo to crisp 200x200 square.
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
  const getCols = () =>
    typeof window === "undefined" ? 3 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  const [cols, setCols] = React.useState(getCols);
  React.useEffect(() => {
    const update = () => setCols(getCols());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [cloudApiUrl, setCloudApiUrl] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Form states
  const [formName, setFormName] = React.useState("");
  const [formRole, setFormRole] = React.useState("");
  const [formCompany, setFormCompany] = React.useState("ITB Bandung");
  const [formQuote, setFormQuote] = React.useState("");
  const [selectedAvatar, setSelectedAvatar] = React.useState("");
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Load cloud URL and cached testimonials on mount
  React.useEffect(() => {
    let activeUrl = DEFAULT_CLOUD_API_URL;
    try {
      const storedUrl = localStorage.getItem(CLOUD_URL_STORAGE_KEY);
      if (storedUrl) activeUrl = storedUrl;
    } catch {}
    setCloudApiUrl(activeUrl);

    // Initial cache
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(isValidTestimonial);
          setTestimonials(clean);
        }
      }
    } catch {}

    // Trigger cloud sync if URL exists
    if (activeUrl) {
      fetchFromCloud(activeUrl);
    }
  }, []);

  const fetchFromCloud = async (url: string) => {
    if (!url || !url.startsWith("http")) return;
    setIsSyncing(true);
    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        redirect: "follow",
      });
      const result = await res.json();
      if (result && result.status === "success" && Array.isArray(result.data)) {
        const cleanData = result.data.filter(isValidTestimonial);
        setTestimonials(cleanData);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanData));
        } catch {}
      }
    } catch (err) {
      console.warn("Cloud fetch notice:", err);
    } finally {
      setIsSyncing(false);
    }
  };

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
    } catch (err: any) {
      setUploadError(err?.message || "Gagal memproses gambar.");
    }
  };

  const handleResetAvatar = () => {
    setSelectedAvatar("");
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

    // 1. Instantly update local wall
    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // 2. Post to Cloud API (Google Apps Script / Webhook) so other devices see it!
    if (cloudApiUrl && cloudApiUrl.startsWith("http")) {
      fetch(cloudApiUrl, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(newTestimonial),
      }).catch((err) => console.warn("Cloud save warning:", err));
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setFormName("");
      setFormRole("");
      setFormQuote("");
      setSelectedAvatar("");
    }, 1500);
  };

  const handleSaveCloudUrl = (url: string) => {
    setCloudApiUrl(url);
    try {
      localStorage.setItem(CLOUD_URL_STORAGE_KEY, url);
    } catch {}
    if (url) {
      fetchFromCloud(url);
    }
    setIsConfigOpen(false);
  };

  // Split messages across as many columns as the screen fits (1 phone, 2 tablet, 3 desktop)
  // so every message stays visible on every screen size.
  const columns = Array.from({ length: cols }, (_, c) => {
    const items = testimonials.filter((_, idx) => idx % cols === c);
    return items.length > 0 ? items : testimonials;
  });
  const baseSpeeds = [32, 48, 38];

  return (
    <section id="ulasan-wall" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-50/70 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section Matching 21st.dev testimonials-6 */}
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-extrabold text-2xl tracking-tight leading-snug text-slate-900 sm:text-4xl">
            Sapa Sadulur
          </h2>
          <p className="text-center text-slate-500 text-sm sm:text-base leading-relaxed">
            Titip salam, kabar, atau ucapan untuk sesama alumni dan santri IKAPMI Bandung.
          </p>

          {/* Interactive Trigger Button */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Tulis Pesan</span>
            </button>

            {cloudApiUrl && (
              <button
                type="button"
                onClick={() => fetchFromCloud(cloudApiUrl)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition shadow-xs cursor-pointer"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-brand-600")} />
                <span>{isSyncing ? "Menyinkronkan..." : "Segarkan"}</span>
              </button>
            )}
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="mt-12 mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8 sm:p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3 border border-brand-200/80">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum ada pesan</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Jadilah yang pertama menyapa sadulur di Bandung.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-95 transition cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Tulis Pesan Pertama</span>
            </button>
          </div>
        ) : (
          /* Draggable & swipeable infinite vertical sliders (1-3 columns) with gradient mask */
          <div
            className={cn(
              "mt-10 flex h-[580px] max-h-[640px] justify-center gap-6 overflow-hidden",
              "mask-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]",
            )}
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            }}
          >
            {columns.map((column, c) => (
              <InfiniteSlider
                key={`${cols}-${c}`}
                direction="vertical"
                speed={Math.max(baseSpeeds[c], column.length * 9)}
                gap={20}
              >
                {column.map((testimonial, i) => (
                  <TestimonialsCard
                    key={`${testimonial.name}-${i}`}
                    testimonial={testimonial}
                  />
                ))}
              </InfiniteSlider>
            ))}
          </div>
        )}
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
                  Pesanmu sudah terkirim dan langsung tampil di Sapa Sadulur.
                </p>
                {cloudApiUrl && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    ✓ Otomatis tersinkron ke Cloud & dapat dilihat di device lain.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1 text-brand-600">
                  <Heart className="w-4 h-4 fill-brand-600" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Sapa Sadulur</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tulis Pesan</h3>
                <p className="text-xs text-slate-500 mt-1 mb-5">
                  Sapa teman seperjuangan, kabari angkatanmu, atau beri semangat untuk santri baru.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Foto Profil:
                    </label>

                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                      {/* Avatar Preview */}
                      <div
                        className={cn(
                          "relative size-14 rounded-full overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-white",
                          selectedAvatar
                            ? "ring-2 ring-brand-500"
                            : "border border-dashed border-slate-300 text-slate-400"
                        )}
                      >
                        {selectedAvatar ? (
                          <img
                            src={selectedAvatar}
                            alt="Preview Foto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>

                      {/* Upload Actions */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="avatar-file-input"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium text-xs shadow-sm transition"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{selectedAvatar ? "Ganti Foto Anda" : "Unggah Foto"}</span>
                          </label>
                          <input
                            id="avatar-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />

                          {selectedAvatar && (
                            <button
                              type="button"
                              onClick={handleResetAvatar}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus foto"
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
                      Pesan <span className="text-rose-500">*</span>
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
                      <span>Kirim Pesan</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Pengaturan Cloud Sync Multi-Device (100% Gratis Google Sheets) */}
      {isConfigOpen && (
        <CloudConfigModal
          currentUrl={cloudApiUrl}
          onSave={handleSaveCloudUrl}
          onClose={() => setIsConfigOpen(false)}
        />
      )}
    </section>
  );
}

function CloudConfigModal({
  currentUrl,
  onSave,
  onClose,
}: {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}) {
  const [urlInput, setUrlInput] = React.useState(currentUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-brand-600 mb-2">
          <Cloud className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Sinkronisasi Cloud Antar-Perangkat</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">Database Ulasan 100% Gratis</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Agar ulasan yang dikirim dari HP atau laptop lain langsung muncul bersamaan (tanpa harus commit/push Git), sambungkan Google Spreadsheet gratis Anda via Google Apps Script.
        </p>

        <div className="space-y-3 mb-5">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Langkah Pasang Cepat (1 Menit):</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Buat Google Spreadsheet baru di Google Drive Anda.</li>
              <li>Klik menu <b>Ekstensi &gt; Apps Script</b>.</li>
              <li>Copy-paste kode dari file <code>GoogleAppsScript_UlasanBackend.js</code>.</li>
              <li>Klik <b>Deploy &gt; New deployment &gt; Web app</b> (Who has access: <b>Anyone</b>).</li>
              <li>Salin URL Web App yang berakhiran <code>/exec</code> lalu tempel di bawah ini:</li>
            </ol>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Apps Script Web App URL:
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(urlInput.trim())}
            className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition"
          >
            Simpan URL Cloud
          </button>
        </div>
      </div>
    </div>
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
        "w-full max-w-xs rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition-all dark:bg-card/20 select-none",
        className,
      )}
      {...props}
    >
      <blockquote className="text-slate-700 text-sm leading-relaxed font-normal">
        "{quote}"
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 pt-3 border-t border-slate-100">
        <Avatar className="size-9 rounded-full ring-2 ring-brand-100/80 shrink-0">
          {image ? (
            <AvatarImage alt={`${name}'s profile picture`} src={image} />
          ) : null}
          <AvatarFallback className="bg-brand-50 text-brand-700 font-semibold text-xs">
            {getInitials(name)}
          </AvatarFallback>
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
