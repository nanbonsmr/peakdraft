import { useState, useEffect } from "react";
import { useInfobase, type InfobaseEntry } from "@/hooks/useInfobase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Globe,
  Users,
  MessageSquare,
  Package,
  Target,
  FileText,
  CheckCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const emptyForm = {
  brand_name: "",
  description: "",
  industry: "",
  target_audience: "",
  tone_of_voice: "",
  website_url: "",
  products_services: "",
  unique_selling_points: "",
  additional_context: "",
};

export default function Infobase() {
  const { entries, activeEntry, setActiveEntry, isLoading, saveEntry, deleteEntry } = useInfobase();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeEntry) {
      setForm({
        brand_name: activeEntry.brand_name || "",
        description: activeEntry.description || "",
        industry: activeEntry.industry || "",
        target_audience: activeEntry.target_audience || "",
        tone_of_voice: activeEntry.tone_of_voice || "",
        website_url: activeEntry.website_url || "",
        products_services: activeEntry.products_services || "",
        unique_selling_points: activeEntry.unique_selling_points || "",
        additional_context: activeEntry.additional_context || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [activeEntry]);

  const handleSave = async () => {
    if (!form.brand_name.trim()) {
      toast({ title: "Brand name is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const result = await saveEntry({
      ...(activeEntry ? { id: activeEntry.id } : {}),
      ...form,
    });
    setIsSaving(false);
    if (result) {
      toast({ title: activeEntry ? "Brand updated!" : "Brand added!", description: `${form.brand_name} has been saved to your Infobase.` });
    } else {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const handleNew = () => {
    setActiveEntry(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    toast({ title: "Brand removed from Infobase" });
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-500" />
            Infobase
          </h2>
          <p className="text-muted-foreground text-sm">
            Add your brand or company info. AI will use this context to generate personalized content across all templates and chat.
          </p>
        </div>
        <Button onClick={handleNew} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New Brand
        </Button>
      </div>

      <Separator />

      {/* Brand Selector */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entries.map((entry) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                activeEntry?.id === entry.id
                  ? "border-violet-500/50 bg-violet-500/10 text-foreground shadow-sm"
                  : "border-border/50 hover:border-violet-500/30 hover:bg-muted/40 text-muted-foreground"
              }`}
              onClick={() => setActiveEntry(entry)}
            >
              <Building2 className="h-3.5 w-3.5" />
              {entry.brand_name}
              {activeEntry?.id === entry.id && <CheckCircle className="h-3.5 w-3.5 text-violet-500" />}
            </motion.button>
          ))}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            {activeEntry ? "Edit Brand Profile" : "Add New Brand"}
          </CardTitle>
          <CardDescription>
            Fill in as much or as little as you want. The AI will use available info to personalize your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brand_name" className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Brand / Company Name *
            </Label>
            <Input
              id="brand_name"
              placeholder="e.g. PeakDraft, Nike, Your Company..."
              value={form.brand_name}
              onChange={(e) => updateField("brand_name", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Brand Description
            </Label>
            <Textarea
              id="description"
              placeholder="Briefly describe what your brand/company does..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-muted-foreground" /> Industry
              </Label>
              <Input
                id="industry"
                placeholder="e.g. SaaS, E-commerce, Healthcare..."
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website_url" className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website URL
              </Label>
              <Input
                id="website_url"
                placeholder="https://yourwebsite.com"
                value={form.website_url}
                onChange={(e) => updateField("website_url", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="target_audience" className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" /> Target Audience
              </Label>
              <Textarea
                id="target_audience"
                placeholder="Who are your ideal customers?"
                value={form.target_audience}
                onChange={(e) => updateField("target_audience", e.target.value)}
                rows={2}
              />
            </div>

            {/* Tone of Voice */}
            <div className="space-y-2">
              <Label htmlFor="tone_of_voice" className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> Tone of Voice
              </Label>
              <Textarea
                id="tone_of_voice"
                placeholder="e.g. Professional, Friendly, Bold, Playful..."
                value={form.tone_of_voice}
                onChange={(e) => updateField("tone_of_voice", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Products/Services */}
          <div className="space-y-2">
            <Label htmlFor="products_services" className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-muted-foreground" /> Products / Services
            </Label>
            <Textarea
              id="products_services"
              placeholder="Describe your main products or services..."
              value={form.products_services}
              onChange={(e) => updateField("products_services", e.target.value)}
              rows={2}
            />
          </div>

          {/* USPs */}
          <div className="space-y-2">
            <Label htmlFor="unique_selling_points" className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> Unique Selling Points
            </Label>
            <Textarea
              id="unique_selling_points"
              placeholder="What makes you different from competitors?"
              value={form.unique_selling_points}
              onChange={(e) => updateField("unique_selling_points", e.target.value)}
              rows={2}
            />
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additional_context" className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Additional Context
            </Label>
            <Textarea
              id="additional_context"
              placeholder="Any other information that might help AI generate better content..."
              value={form.additional_context}
              onChange={(e) => updateField("additional_context", e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={isSaving || !form.brand_name.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : activeEntry ? "Update Brand" : "Save Brand"}
            </Button>
            {activeEntry && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this brand?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{activeEntry.brand_name}" from your Infobase.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(activeEntry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">How Infobase works</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you enable Infobase in any template or AI Chat, the AI will use your brand information as context to generate content that's aligned with your brand voice, audience, and values. You can toggle it on/off per generation — it's completely optional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
