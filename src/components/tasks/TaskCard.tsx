import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  template_type: string | null;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onEdit: () => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To-Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing group w-full ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-xs sm:text-sm line-clamp-2 flex-1">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {STATUS_OPTIONS.map(status => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onStatusChange(task.id, status.value)}
                >
                  Move to {status.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-2 space-y-2 sm:space-y-3">
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] + " text-xs"}>
            {task.priority}
          </Badge>
          
          {task.template_type && (
            <Badge variant="outline" className="text-xs">
              {task.template_type}
            </Badge>
          )}
        </div>

        {task.due_date && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            <span className="truncate">{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
            {isOverdue && (
              <Badge variant="destructive" className="ml-1 text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}