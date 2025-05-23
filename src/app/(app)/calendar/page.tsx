
"use client";
import type { ReactNode } from 'react';
import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, isSameMonth, isSameDay, startOfDay } from 'date-fns'; 
import type { DayContentProps as RDPDayContentProps, Modifiers } from 'react-day-picker';
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'meeting' | 'reminder';
  description?: string;
  isImportant?: boolean; // Added for future use with notifications
}

// Events list is now initially empty
const sampleEvents: CalendarEvent[] = [];

const EventBadge = memo(function EventBadge({ type }: { type: CalendarEvent['type'] }) {
  const colors = {
    task: 'bg-blue-500',
    meeting: 'bg-green-500',
    reminder: 'bg-yellow-500',
  };
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${colors[type]}`} />;
});

interface CustomDayContentProps extends RDPDayContentProps {
  allEvents: CalendarEvent[];
}

const CustomDayContent = memo(function CustomDayContent({
  date,
  activeModifiers,
  displayMonth,
  allEvents,
}: CustomDayContentProps) {
  const dayEvents = allEvents.filter(
    (event) => isSameDay(event.date, date) && isSameMonth(event.date, displayMonth)
  );
  return (
    <div className={cn("h-full w-full p-1.5 font-normal justify-start items-start flex flex-col", {"opacity-50": !isSameMonth(date, displayMonth)})}>
      <span className={cn("self-start", {"font-bold text-primary": activeModifiers.selected, "font-bold": activeModifiers.today})}>{format(date, "d")}</span>
      {dayEvents.length > 0 && isSameMonth(date, displayMonth) && (
        <div className="mt-1 space-y-0.5 overflow-y-auto max-h-10 text-xs w-full">
          {dayEvents.slice(0,2).map(event => (
            <div key={event.id} className="flex items-center truncate">
              <EventBadge type={event.type} />
              <span className="truncate text-foreground/80">{event.title}</span>
            </div>
          ))}
          {dayEvents.length > 2 && <div className="text-muted-foreground text-[10px]">+{dayEvents.length-2} more</div>}
        </div>
      )}
    </div>
  );
});

const MemoizedEventListItem = memo(function EventListItem({event}: {event: CalendarEvent}) {
  return (
    <div className="p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center mb-1">
        <EventBadge type={event.type} />
        <h4 className="font-semibold text-sm">{event.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground">{format(event.date, "p")}</p>
      {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
    </div>
  );
});

const MemoizedUpcomingEventItem = memo(function UpcomingEventItem({event}: {event: CalendarEvent}) {
  return (
    <div className="p-2 rounded-md border text-xs">
      <div className="flex items-center">
        <EventBadge type={event.type} />
        <span className="font-medium">{event.title}</span>
      </div>
      <span className="text-muted-foreground ml-4">{format(event.date, "MMM d, p")}</span>
    </div>
  );
});


export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents); // Uses the initially empty sampleEvents
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
    setHydrated(true);
  }, []);


  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
  }, []);

  const nextMonth = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), []);
  const prevMonth = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), []);
  const today = useCallback(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  }, []);

  const getEventsForDate = useCallback((date: Date | undefined) => {
    if (!date) return [];
    return events.filter(event => isSameDay(event.date, date));
  }, [events]);
  
  const selectedDateEvents = useMemo(() => getEventsForDate(selectedDate), [selectedDate, getEventsForDate]);

  const dayPickerComponents = useMemo(() => ({
    DayContent: (props: RDPDayContentProps) => (
      <CustomDayContent
        {...props} 
        allEvents={events}
      />
    ),
  }), [events]);

  const renderMonthView = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      month={currentDate}
      onMonthChange={setCurrentDate}
      className="rounded-md border shadow-md p-0"
      classNames={{
        day_cell: "text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-24",
        day: cn("h-full w-full p-0 font-normal aria-selected:opacity-100"),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_today: "font-bold text-accent-foreground",
        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] h-10",
        caption_label: "text-lg font-medium",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-4 w-full",
        table: "w-full border-collapse space-y-1",
        row: "flex w-full mt-0", 
        day_outside: "text-muted-foreground/50",
      }}
      components={dayPickerComponents}
    />
  );

  const renderWeekView = () => <Card className="p-4 min-h-[400px] flex items-center justify-center"><p>Week View (Coming Soon)</p></Card>;
  const renderDayView = () => <Card className="p-4 min-h-[400px] flex items-center justify-center"><p>Day View (Coming Soon)</p></Card>;

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-9 w-36 bg-muted rounded"></div>
            <div className="h-5 w-64 bg-muted rounded mt-1"></div>
          </div>
          <div className="h-10 w-40 bg-muted rounded-md"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="h-[600px] w-full bg-muted rounded-md"></div>
          </div>
          <div className="w-full md:w-80 lg:w-96 space-y-4">
            <div className="h-48 w-full bg-muted rounded-md"></div>
            <div className="h-48 w-full bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and events.</p>
        </div>
        <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={today}>Today</Button>
               </div>
               <div>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                </Select>
               </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-80 lg:w-96 space-y-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>
                        {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a date"}
                    </CardTitle>
                    <CardDescription>
                        {selectedDateEvents.length > 0 ? `${selectedDateEvents.length} event(s)` : "No events scheduled"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[450px] overflow-y-auto">
                    {selectedDateEvents.length > 0 ? selectedDateEvents.map(event => (
                        <MemoizedEventListItem key={event.id} event={event} />
                    )) : (
                        <div className="text-center text-muted-foreground py-8">
                             <List className="mx-auto h-12 w-12 opacity-30" />
                             <p>No events for this day.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="shadow-lg" data-ai-hint="upcoming events list">
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Next 5 events across all dates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                    {events
                        .filter(event => {
                            const todayStart = startOfDay(new Date());
                            return event.date >= todayStart;
                         })
                        .sort((a,b) => a.date.getTime() - b.date.getTime())
                        .slice(0,5)
                        .map(event => (
                          <MemoizedUpcomingEventItem key={event.id} event={event} />
                    ))}
                    {events.filter(event => {
                            const todayStart = startOfDay(new Date());
                            return event.date >= todayStart;
                        }).length === 0 && (
                         <p className="text-sm text-muted-foreground text-center py-4">No upcoming events.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
