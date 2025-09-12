import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TemplateCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  examples?: string[];
}

export function TemplateCard({ title, description, icon, href, examples }: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-gradient-primary/10 rounded-xl w-fit">
            {icon}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            asChild
          >
            <Link to={href}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      
      {examples && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Examples:
            </p>
            <div className="space-y-1">
              {examples.slice(0, 2).map((example, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-background/50 rounded-md border"
                >
                  "{example}"
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}