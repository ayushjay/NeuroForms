import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dashboardApi } from "@/lib/api";

interface ShareFormModalProps {
  formId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ShareFormModal = ({ formId, isOpen, onClose }: ShareFormModalProps) => {
  const [useShortLink, setUseShortLink] = useState(false);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const longUrl = `${window.location.origin}/forms/${formId}`;
  const displayUrl = useShortLink && shortCode
    ? `${window.location.origin}/s/${shortCode}`
    : longUrl;

  const handleToggle = async (checked: boolean) => {
    setUseShortLink(checked);
    if (checked && !shortCode) {
      setLoading(true);
      try {
        const res = await dashboardApi.shortenUrl(formId);
        setShortCode(res.short_code);
      } catch (err) {
        setUseShortLink(false);
        toast({ title: "Failed to create short link", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Anyone with this link can view and submit the form.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="shorten"
              checked={useShortLink}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
            <Label htmlFor="shorten" className="flex items-center gap-2 cursor-pointer">
              Shorten URL
              {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="link"
                  value={displayUrl}
                  readOnly
                  className="pl-9 bg-muted/50 font-mono text-sm"
                />
              </div>
            </div>
            <Button size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFormModal;
