import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, MessageSquare, Paperclip, CalendarIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface TaskCardProps extends ComponentProps<typeof Card> {
  title: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
  commentsCount?: number;
  attachmentsCount?: number;
  priority?: "low" | "medium" | "high";
}

const TaskCardInner = ({ 
  title, 
  description, 
  dueDate, 
  tags, 
  commentsCount, 
  attachmentsCount, 
  priority,
  className, 
  ...props 
}: TaskCardProps) => {
  
  const priorityColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  return (
    <Card className={cn("mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing", className)} {...props} data-ai-hint="task item">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
          <GripVertical className="h-5 w-5 text-[#282623] cursor-grab" />
        </div>
        {description && <CardDescription className="text-xs mt-1 line-clamp-2">{description}</CardDescription>}
      </CardHeader>
      {(tags && tags.length > 0 || dueDate) && (
        <CardContent className="p-4 pt-0">
          {dueDate && (
            <div className="flex items-center text-xs text-[#4F4A49] mb-2 font-medium">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>{dueDate}</span>
            </div>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">#{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-3 text-[#4F4A49] font-medium">
          {typeof commentsCount === 'number' && (
            <div className="flex items-center text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> {commentsCount}
            </div>
          )}
          {typeof attachmentsCount === 'number' && (
            <div className="flex items-center text-xs">
              <Paperclip className="h-3.5 w-3.5 mr-1" /> {attachmentsCount}
            </div>
          )}
        </div>
        {priority && (
          <div className={`h-2 w-2 rounded-full ${priorityColors[priority]}`} title={`Priority: ${priority}`}></div>
        )}
      </CardFooter>
    </Card>
  );
}

export const TaskCard = memo(TaskCardInner);
