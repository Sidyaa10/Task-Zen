import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import Image from "next/image";

export function CalendarViewPlaceholder() {
  return (
    <Card className="shadow-lg" data-ai-hint="calendar schedule">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <CardTitle>Calendar & Timeline View</CardTitle>
        </div>
        <CardDescription>
          Visualize your tasks and deadlines on a calendar or timeline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center border border-dashed">
          {/* Placeholder image for a calendar */}
          <Image 
            src="https://picsum.photos/600/338?random=1&grayscale&blur=2" 
            alt="Calendar placeholder" 
            width={600} 
            height={338}
            className="rounded-md opacity-50"
            data-ai-hint="calendar schedule"
          />
          <p className="absolute text-lg font-medium text-foreground/70">Calendar View Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
