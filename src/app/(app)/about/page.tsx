import { ArrowUpRight, Github, Linkedin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const links = [
    {
      label: 'GitHub',
      href: 'https://github.com/Sidyaa10',
      description: 'Code, commits, and project history',
      icon: Github,
      accent: 'bg-[#D0CBE3]/65',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/siddhesh-kadam-5b0961367/',
      description: 'Professional profile and network',
      icon: Linkedin,
      accent: 'bg-[#ABC1C7]/55',
    },
    {
      label: 'Portfolio',
      href: 'https://sid-kadam.vercel.app/',
      description: 'Work showcase and personal brand',
      icon: Sparkles,
      accent: 'bg-[#9997BF]/45',
    },
  ];

  return (
    <div className="space-y-5 pb-24">
      <Card className="taskzen-card">
        <CardHeader className="pb-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#746D6C]/20 bg-white/80 px-3 py-1 text-xs font-semibold text-[#746D6C]">
            <Sparkles className="h-3.5 w-3.5" />
            About Task-Zen
          </div>
          <CardTitle className="text-3xl leading-tight text-[#282623]">Structured focus. Measurable growth.</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-relaxed text-[#746D6C]">
            Task-Zen is a modern productivity system that turns goals, events, and deadlines into scheduled execution. Every commitment is
            time-blocked, trackable, and designed to move from intention to completion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#282623]">What Task-Zen does</p>
              <p className="mt-1 text-sm leading-relaxed text-[#746D6C]">
                Combines Event Reminders, Skill Development Goals, Deadline Projects, and Daily Quick Tasks in one intelligent schedule.
              </p>
            </div>
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#282623]">Vision</p>
              <p className="mt-1 text-sm leading-relaxed text-[#746D6C]">
                A calm SaaS workspace where planning is simple, execution is clear, and progress is measurable every day.
              </p>
            </div>
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#282623]">How it helps</p>
              <p className="mt-1 text-sm leading-relaxed text-[#746D6C]">
                Transforms vague intentions into scheduled sessions, clear timelines, and reliable completion outcomes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="taskzen-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl text-[#282623]">
            <Sparkles className="h-4 w-4" />
            Created by Siddhesh Kadam
          </CardTitle>
          <CardDescription className="text-sm text-[#746D6C]">Connect with my profiles and portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-[#746D6C]/20 bg-white/80 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold text-[#282623] ${link.accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </div>
                <p className="text-sm text-[#746D6C]">{link.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#282623]">
                  Visit <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
