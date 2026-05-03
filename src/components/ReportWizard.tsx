import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Siren, AudioLines, ShieldHalf, Landmark, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReportType = {
  key: string;
  label: string;
  desc: string;
  icon: typeof Siren;
  path: string;
};

const TYPES: ReportType[] = [
  { key: "incident", label: "An incident", desc: "Violence, theft, harassment, displacement", icon: Siren, path: "/incidents" },
  { key: "voice", label: "A voice story", desc: "Record what you witnessed", icon: AudioLines, path: "/voice" },
  { key: "safety", label: "Safety concern", desc: "Find help, safe spaces, or check in", icon: ShieldHalf, path: "/safety" },
  { key: "election", label: "Election issue", desc: "Polling problems or election violence", icon: Landmark, path: "/elections" },
];

/**
 * Single 3-step "What → Where → Send" wizard that consolidates every reporting entry-point.
 * Step 3 routes the user to the existing detailed flow with their context preserved.
 */
const ReportWizard = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<ReportType | null>(null);
  const [location, setLocation] = useState<"current" | "manual" | null>(null);

  const reset = () => {
    setStep(1);
    setType(null);
    setLocation(null);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };

  const finish = () => {
    if (!type) return;
    onOpenChange(false);
    const params = new URLSearchParams();
    if (location === "current") params.set("location", "auto");
    navigate(`${type.path}?${params.toString()}`);
    setTimeout(reset, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Siren className="w-4 h-4 text-destructive" />
            New report
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 — {step === 1 ? "what happened?" : step === 2 ? "where?" : "send it"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const selected = type?.key === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setType(t);
                    setStep(2);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <button
              onClick={() => {
                setLocation("current");
                setStep(3);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                location === "current" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}
            >
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Use my current location</p>
                <p className="text-xs text-muted-foreground">Fastest — we'll detect it</p>
              </div>
            </button>
            <button
              onClick={() => {
                setLocation("manual");
                setStep(3);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                location === "manual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}
            >
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">I'll enter it manually</p>
                <p className="text-xs text-muted-foreground">Pin on map or type address</p>
              </div>
            </button>
          </div>
        )}

        {step === 3 && type && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 bg-muted/30 text-sm space-y-1">
              <p><span className="text-muted-foreground">Type:</span> <span className="font-medium">{type.label}</span></p>
              <p><span className="text-muted-foreground">Location:</span> <span className="font-medium">{location === "current" ? "Current location" : "Manual entry"}</span></p>
            </div>
            <p className="text-xs text-muted-foreground">
              We'll take you to the full form to add details, photos, and submit.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step > 1 ? setStep((step - 1) as 1 | 2 | 3) : close())}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          {step === 3 && (
            <Button size="sm" onClick={finish}>
              Continue
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportWizard;
