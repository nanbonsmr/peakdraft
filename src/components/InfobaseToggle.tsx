import { useState, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInfobase, type InfobaseEntry } from "@/hooks/useInfobase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface InfobaseToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  selectedEntry: InfobaseEntry | null;
  onSelectEntry: (entry: InfobaseEntry | null) => void;
}

export function InfobaseToggle({ enabled, onToggle, selectedEntry, onSelectEntry }: InfobaseToggleProps) {
  const { entries, isLoading } = useInfobase();
  const navigate = useNavigate();

  useEffect(() => {
    if (enabled && !selectedEntry && entries.length > 0) {
      onSelectEntry(entries[0]);
    }
  }, [enabled, entries]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40 bg-muted/20">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground flex-1">No brand in Infobase</span>
        <Button variant="link" size="sm" className="text-xs h-auto p-0 text-violet-400" onClick={() => navigate("/app/infobase")}>
          Add brand
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40 bg-muted/20">
      <Building2 className="h-4 w-4 text-violet-400" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Label htmlFor="infobase-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap">
          Infobase
        </Label>
        <Switch id="infobase-toggle" checked={enabled} onCheckedChange={onToggle} className="scale-75" />
      </div>
      {enabled && entries.length > 1 && (
        <Select
          value={selectedEntry?.id || ""}
          onValueChange={(id) => {
            const entry = entries.find((e) => e.id === id) || null;
            onSelectEntry(entry);
          }}
        >
          <SelectTrigger className="h-7 text-xs w-auto min-w-[120px] border-border/30">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {entries.map((entry) => (
              <SelectItem key={entry.id} value={entry.id} className="text-xs">
                {entry.brand_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {enabled && entries.length === 1 && (
        <span className="text-xs text-muted-foreground truncate">{entries[0].brand_name}</span>
      )}
    </div>
  );
}

export function useInfobaseContext() {
  const { entries, activeEntry, buildBrandContext } = useInfobase();
  const [infobaseEnabled, setInfobaseEnabled] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<InfobaseEntry | null>(null);

  useEffect(() => {
    if (entries.length > 0 && !selectedEntry) {
      setSelectedEntry(entries[0]);
    }
  }, [entries]);

  const getBrandContextString = (): string => {
    if (!infobaseEnabled || !selectedEntry) return "";
    return buildBrandContext(selectedEntry);
  };

  return {
    infobaseEnabled,
    setInfobaseEnabled,
    selectedEntry,
    setSelectedEntry,
    getBrandContextString,
  };
}
