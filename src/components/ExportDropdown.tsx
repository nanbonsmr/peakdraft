import { useState } from 'react';
import { Download, FileText, FileType, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { exportContent, ExportFormat } from '@/lib/exportUtils';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ExportDropdownProps {
  content: string;
  filename: string;
  disabled?: boolean;
}

export function ExportDropdown({ content, filename, disabled = false }: ExportDropdownProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const isPaidUser = profile?.subscription_plan && profile.subscription_plan !== 'free';

  const handleExport = async (format: ExportFormat) => {
    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "Export functionality is only available for paid plans. Upgrade to unlock this feature!",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/pricing')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Upgrade Now
          </Button>
        ),
      });
      return;
    }

    if (!content || !content.trim()) {
      toast({
        title: "No content to export",
        description: "Please generate content first before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportContent(content, format, filename);
      toast({
        title: "Export successful!",
        description: `Content exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || !content}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export
          {!isPaidUser && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Pro
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={!isPaidUser || isExporting}
          className="cursor-pointer gap-2"
        >
          <File className="w-4 h-4 text-red-600" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('docx')}
          disabled={!isPaidUser || isExporting}
          className="cursor-pointer gap-2"
        >
          <FileType className="w-4 h-4 text-blue-600" />
          <span>Export as DOCX</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('txt')}
          disabled={!isPaidUser || isExporting}
          className="cursor-pointer gap-2"
        >
          <FileText className="w-4 h-4 text-gray-600" />
          <span>Export as TXT</span>
        </DropdownMenuItem>
        {!isPaidUser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/app/pricing')}
              className="cursor-pointer text-primary font-medium"
            >
              Upgrade to Export
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
