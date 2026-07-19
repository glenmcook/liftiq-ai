import { useState, useRef } from "react";
import { useListDexaScans, useCreateDexaScan } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Plus, Activity, Loader2, Upload, FileText, X, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type ParsedDexa = {
  scanDate: string;
  bodyFatPercent: number | null;
  leanMassLbs: number | null;
  fatMassLbs: number | null;
  boneDensity: number | null;
  totalWeightLbs: number | null;
  visceralFatLevel: number | null;
  notes: string | null;
};

const emptyForm: ParsedDexa = {
  scanDate: new Date().toISOString().split("T")[0],
  bodyFatPercent: null,
  leanMassLbs: null,
  fatMassLbs: null,
  boneDensity: null,
  totalWeightLbs: null,
  visceralFatLevel: null,
  notes: null,
};

function Field({ label, value, onChange, step = "0.1", unit }: {
  label: string; value: number | null; onChange: (v: number | null) => void; step?: string; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}{unit ? ` (${unit})` : ""}</label>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="—"
        className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
      />
    </div>
  );
}

export default function Dexa() {
  const { data: scans, isLoading } = useListDexaScans();
  const createScan = useCreateDexaScan();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"upload" | "manual" | null>(null);
  const [formData, setFormData] = useState<ParsedDexa>(emptyForm);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof ParsedDexa) => (v: any) => setFormData(f => ({ ...f, [key]: v }));

  const openMode = (m: "upload" | "manual") => {
    setMode(m);
    setFormData(emptyForm);
    setUploadFile(null);
    setParsed(false);
    setUploadError(null);
  };

  const closeForm = () => {
    setMode(null);
    setFormData(emptyForm);
    setUploadFile(null);
    setParsed(false);
    setUploadError(null);
  };

  const handleFile = async (file: File) => {
    setUploadFile(file);
    setUploading(true);
    setUploadError(null);
    setParsed(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${import.meta.env.BASE_URL}api/dexa-scans/parse`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Parse failed");
      const data: ParsedDexa = await res.json();
      setFormData(data);
      setParsed(true);
    } catch (err: any) {
      setUploadError(err.message ?? "Could not read file. Try a clearer image or enter manually.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { scanDate: formData.scanDate };
    if (formData.bodyFatPercent != null) payload.bodyFatPercent = formData.bodyFatPercent;
    if (formData.leanMassLbs != null) payload.leanMassLbs = formData.leanMassLbs;
    if (formData.fatMassLbs != null) payload.fatMassLbs = formData.fatMassLbs;
    if (formData.boneDensity != null) payload.boneDensity = formData.boneDensity;
    if (formData.totalWeightLbs != null) payload.totalWeightLbs = formData.totalWeightLbs;
    if (formData.visceralFatLevel != null) payload.visceralFatLevel = formData.visceralFatLevel;
    if (formData.notes) payload.notes = formData.notes;
    await createScan.mutateAsync({ data: payload });
    queryClient.invalidateQueries({ queryKey: ["/api/dexa"] });
    closeForm();
  };

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-widest uppercase">DEXA Logs</h1>
            <p className="text-primary font-mono text-sm tracking-widest">BODY COMPOSITION SCANS</p>
          </div>
          {mode === null && (
            <div className="flex gap-3">
              <button onClick={() => openMode("upload")} className="bg-card border border-border text-foreground px-5 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:border-primary/50 transition-all text-sm">
                <Upload className="w-4 h-4 text-primary" /> Upload Report
              </button>
              <button onClick={() => openMode("manual")} className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all text-sm">
                <Plus className="w-4 h-4" /> Enter Manually
              </button>
            </div>
          )}
        </header>

        {/* UPLOAD MODE */}
        {mode === "upload" && (
          <div className="bg-card border border-border p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tight">Upload DEXA Report</h2>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload a photo or screenshot of your DEXA report. The AI will read it and extract your body composition numbers automatically. Supported: <span className="text-foreground font-medium">JPG, PNG, WebP, PDF</span>.
            </p>

            {!uploadFile && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-card/80"}`}
              >
                <Upload className={`w-10 h-10 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-center">
                  <p className="font-bold text-foreground">Drop your DEXA report here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            )}

            {uploadFile && (
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="font-mono text-sm truncate flex-1">{uploadFile.name}</span>
                {!uploading && <button onClick={() => { setUploadFile(null); setParsed(false); setUploadError(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
              </div>
            )}

            {uploading && (
              <div className="flex items-center gap-3 text-primary font-mono text-sm animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" /> AI is reading your report...
              </div>
            )}

            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-mono">
                {uploadError}
              </div>
            )}

            {parsed && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold">
                  <CheckCircle className="w-5 h-5" /> Data extracted — review and save
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Date</label>
                      <input type="date" value={formData.scanDate} onChange={e => set("scanDate")(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    </div>
                    <Field label="Body Fat" unit="%" value={formData.bodyFatPercent} onChange={set("bodyFatPercent")} />
                    <Field label="Lean Mass" unit="lbs" value={formData.leanMassLbs} onChange={set("leanMassLbs")} />
                    <Field label="Fat Mass" unit="lbs" value={formData.fatMassLbs} onChange={set("fatMassLbs")} />
                    <Field label="Total Weight" unit="lbs" value={formData.totalWeightLbs} onChange={set("totalWeightLbs")} />
                    <Field label="Bone Density" unit="g/cm²" value={formData.boneDensity} onChange={set("boneDensity")} />
                    <Field label="Visceral Fat Level" value={formData.visceralFatLevel} onChange={set("visceralFatLevel")} step="1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Notes</label>
                    <textarea value={formData.notes ?? ""} onChange={e => set("notes")(e.target.value || null)} placeholder="AI-extracted notes or observations..." className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px] resize-none transition-all" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl border border-border font-bold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                    <button type="submit" disabled={createScan.isPending} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all text-sm">
                      {createScan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Scan"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tight">Enter Scan Data Manually</h2>
              <button type="button" onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Date</label>
                <input type="date" value={formData.scanDate} onChange={e => set("scanDate")(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
              </div>
              <Field label="Body Fat" unit="%" value={formData.bodyFatPercent} onChange={set("bodyFatPercent")} />
              <Field label="Lean Mass" unit="lbs" value={formData.leanMassLbs} onChange={set("leanMassLbs")} />
              <Field label="Fat Mass" unit="lbs" value={formData.fatMassLbs} onChange={set("fatMassLbs")} />
              <Field label="Total Weight" unit="lbs" value={formData.totalWeightLbs} onChange={set("totalWeightLbs")} />
              <Field label="Bone Density" unit="g/cm²" value={formData.boneDensity} onChange={set("boneDensity")} />
              <Field label="Visceral Fat Level" value={formData.visceralFatLevel} onChange={set("visceralFatLevel")} step="1" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Notes</label>
              <textarea value={formData.notes ?? ""} onChange={e => set("notes")(e.target.value || null)} placeholder="Any additional notes..." className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px] resize-none transition-all" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl border border-border font-bold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-all">Cancel</button>
              <button type="submit" disabled={createScan.isPending} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all text-sm">
                {createScan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Scan"}
              </button>
            </div>
          </form>
        )}

        {/* SCAN LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse font-mono text-primary tracking-widest text-center py-10">RETRIEVING DATA...</div>
          ) : scans?.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30 font-mono text-muted-foreground tracking-widest">
              NO SCANS ARCHIVED.
            </div>
          ) : scans?.map(scan => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function ScanCard({ scan }: { scan: any }) {
  const [expanded, setExpanded] = useState(false);
  const extras = [
    scan.fatMassLbs != null && { label: "Fat Mass", value: `${scan.fatMassLbs} lbs` },
    scan.totalWeightLbs != null && { label: "Total Weight", value: `${scan.totalWeightLbs} lbs` },
    scan.boneDensity != null && { label: "Bone Density", value: `${scan.boneDensity} g/cm²` },
    scan.visceralFatLevel != null && { label: "Visceral Fat", value: scan.visceralFatLevel },
  ].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <div className="bg-card border border-border rounded-3xl hover:border-blue-500/30 transition-colors group overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
            <Activity className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <div className="font-extrabold text-2xl tracking-tight">{new Date(scan.scanDate).toLocaleDateString()}</div>
            <div className="text-xs font-mono text-muted-foreground tracking-widest mt-1">SCAN ID: {scan.id}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {scan.bodyFatPercent != null && (
            <div className="bg-background border border-border p-4 rounded-2xl min-w-[110px]">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Body Fat</div>
              <div className="text-2xl font-extrabold font-mono text-blue-400">{scan.bodyFatPercent}%</div>
            </div>
          )}
          {scan.leanMassLbs != null && (
            <div className="bg-background border border-border p-4 rounded-2xl min-w-[120px]">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Lean Mass</div>
              <div className="text-2xl font-extrabold font-mono text-primary">{scan.leanMassLbs} <span className="text-xs">LBS</span></div>
            </div>
          )}
          {extras.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground hover:text-foreground transition-colors p-2">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      {expanded && extras.length > 0 && (
        <div className="px-8 pb-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-border/50 pt-4">
          {extras.map(e => (
            <div key={e.label} className="bg-background border border-border p-3 rounded-xl">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">{e.label}</div>
              <div className="font-bold font-mono">{e.value}</div>
            </div>
          ))}
          {scan.notes && (
            <div className="col-span-full bg-background border border-border p-3 rounded-xl">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Notes</div>
              <div className="text-sm font-mono text-muted-foreground">{scan.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
