import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Clock, Hash, Calendar, Copy, Trash2 } from 'lucide-react';
import { ExportDropdown } from '@/components/ExportDropdown';

interface RecentContentProps {
  recentContent: any[];
  templateTitle: string;
  templateIcon: React.ComponentType<{ className?: string }>;
  templateBgColor: string;
  templateColor: string;
  onCopyContent: (content: string) => void;
  onDeleteContent: (contentId: string) => void;
}

export function RecentContent({
  recentContent,
  templateTitle,
  templateIcon: Icon,
  templateBgColor,
  templateColor,
  onCopyContent,
  onDeleteContent
}: RecentContentProps) {
  return (
    <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-xl">
            <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          Recent {templateTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentContent.length > 0 ? (
            recentContent.map((content, index) => (
              <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl hover:from-muted/50 hover:to-muted/20 transition-all duration-300 border border-muted-foreground/10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-3 rounded-xl ${templateBgColor} ${templateColor} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" title={content.prompt}>
                      {content.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium">{content.word_count} words</span>
                      <span>•</span>
                      <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Clock className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {templateTitle} Content
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Content Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            <span>{content.word_count} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(content.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Original Prompt */}
                        <div className="space-y-2">
                          <Label className="font-semibold">Original Prompt:</Label>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm">{content.prompt}</p>
                          </div>
                        </div>

                        {/* Generated Content */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">Generated Content:</Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCopyContent(content.generated_content)}
                                className="flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Copy
                              </Button>
                              <ExportDropdown
                                content={content.generated_content}
                                filename={`${content.template_type}-${Date.now()}`}
                              />
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {content.generated_content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteContent(content.id)}
                    className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete content"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="p-6 bg-muted/30 rounded-3xl mb-4 mx-auto w-fit">
                <Icon className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No {templateTitle.toLowerCase()} yet</h3>
              <p className="text-muted-foreground text-sm">
                Create your first {templateTitle.toLowerCase()} content to see it here!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
