import { Github, Linkedin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;

  return (
    <div className="space-y-5 pb-24">
      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="text-2xl">About Task-Zen</CardTitle>
          <CardDescription>Structured focus. Measurable growth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-[#746D6C]">
          <p>
            Task-Zen is a professional productivity platform built for event scheduling, long-term skill growth, and deadline-driven execution.
            It combines calendar intelligence with deterministic progress tracking so planning translates into visible outcomes.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
              <p className="text-sm font-semibold text-[#282623]">What it does</p>
              <p className="text-sm">Unifies Event Reminder, Skill Development Goals, Deadline Projects, and Daily Quick Tasks under one schedule system.</p>
            </div>
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
              <p className="text-sm font-semibold text-[#282623]">Product vision</p>
              <p className="text-sm">A calm, premium workspace where every commitment has time, context, and measurable completion.</p>
            </div>
            <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
              <p className="text-sm font-semibold text-[#282623]">How it helps</p>
              <p className="text-sm">Transforms vague goals into scheduled sessions, clear progress percentages, and reliable completion logs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-4 w-4" />Connect</CardTitle>
          <CardDescription>Keep your professional profiles linked to your product portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {githubUrl ? (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#746D6C]/20 bg-white/70 px-3 py-2 text-[#282623] transition hover:bg-white">
              <Github className="h-4 w-4" /> GitHub Profile
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#746D6C]/30 bg-white/50 px-3 py-2 text-[#746D6C]">
              <Github className="h-4 w-4" /> Set `NEXT_PUBLIC_GITHUB_URL` in `.env.local`
            </div>
          )}
          {linkedinUrl ? (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#746D6C]/20 bg-white/70 px-3 py-2 text-[#282623] transition hover:bg-white">
              <Linkedin className="h-4 w-4" /> LinkedIn Profile
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#746D6C]/30 bg-white/50 px-3 py-2 text-[#746D6C]">
              <Linkedin className="h-4 w-4" /> Set `NEXT_PUBLIC_LINKEDIN_URL` in `.env.local`
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
