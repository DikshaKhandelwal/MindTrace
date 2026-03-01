/**
 * Silent Burnout Detector — Backend Route
 * Real GitHub API + GPT-4o-mini analysis. Zero mock data.
 */
import express from 'express';
import OpenAI from 'openai';

export const burnoutRouter = express.Router();

// ── GitHub proxy (avoids CORS + keeps token server-side) ─────────────────────
burnoutRouter.post('/github/commits', async (req, res) => {
  const { owner, repo, token, since } = req.body;
  if (!owner || !repo) return res.status(400).json({ error: 'owner and repo are required' });

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MindTrace-BurnoutDetector/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    // Fetch up to 100 commits; paginate if needed for 90-day window
    const params = new URLSearchParams({ per_page: 100 });
    if (since) params.set('since', since);

    const resp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?${params}`,
      { headers }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({
        error: err.message || `GitHub API returned ${resp.status}`,
        github_status: resp.status,
      });
    }

    const raw = await resp.json();

    // Normalize to minimal shape — only what the detector needs
    const commits = raw.map(c => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message || '',
      author: c.commit?.author?.name || '',
      date: c.commit?.author?.date || '',
      additions: c.stats?.additions ?? null,
      deletions: c.stats?.deletions ?? null,
    }));

    // Also grab contributor stats (commit frequency over weeks) — async, 202 retry
    let weeklyFreq = null;
    const statsResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
      { headers }
    );
    if (statsResp.ok) {
      const statsData = await statsResp.json();
      if (Array.isArray(statsData)) {
        weeklyFreq = statsData.slice(-12).map(w => ({ week: w.week, total: w.total }));
      }
    }

    res.json({ commits, weeklyFreq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GPT burnout analysis ──────────────────────────────────────────────────────
burnoutRouter.post('/analyze', async (req, res) => {
  const {
    gitMetrics,    // { nightCommitRatio, avgMsgLength, frequencyTrend, bugFixRatio, totalCommits, recentCommits }
    typingMetrics, // { avgWpm, wpmTrend, backspaceRate, avgPauseMs, sessions }
    activityLog,   // last 7 entries: [{ date, mood, focus, hoursWorked, meetings, breaks, overtime }]
    localScore,    // 0–100 pre-computed client score
  } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'GPT not configured — set OPENAI_API_KEY' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are BurnoutAI — a developer-wellness expert trained in software engineering burnout research.
You receive real behavioral signals from a developer and generate a precise, compassionate burnout assessment.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

JSON schema:
{
  "burnoutScore": 0-100,
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "headline": "one punchy sentence summarising their situation",
  "primarySignals": ["signal 1", "signal 2", "signal 3"],
  "warningFlags": ["flag if any"] or [],
  "narrative": "2-3 paragraph compassionate analysis in second person (\"you\")",
  "recommendations": [
    { "priority": "immediate" | "short-term" | "long-term", "action": "...", "why": "..." }
  ],
  "positives": ["things they are still doing well"],
  "checkInPrompt": "one gentle introspective question to sit with"
}`;

  const userContent = `Developer behavioral data — analyze for burnout:

GIT SIGNALS (last 90 days):
- Total commits: ${gitMetrics.totalCommits ?? 'N/A'}
- Night commits (22:00–05:00): ${gitMetrics.nightCommitRatio != null ? `${(gitMetrics.nightCommitRatio * 100).toFixed(1)}%` : 'N/A'}
- Avg commit message length: ${gitMetrics.avgMsgLength != null ? `${gitMetrics.avgMsgLength} chars` : 'N/A'}
- Bug/fix ratio vs feature: ${gitMetrics.bugFixRatio != null ? `${(gitMetrics.bugFixRatio * 100).toFixed(1)}% are bug fixes` : 'N/A'}
- Commit frequency trend (last 4w vs prev 4w): ${gitMetrics.frequencyTrend != null ? `${gitMetrics.frequencyTrend > 0 ? '+' : ''}${(gitMetrics.frequencyTrend * 100).toFixed(0)}%` : 'N/A'}
- Weekend commits: ${gitMetrics.weekendRatio != null ? `${(gitMetrics.weekendRatio * 100).toFixed(1)}%` : 'N/A'}

TYPING SIGNALS:
- Avg WPM: ${typingMetrics?.avgWpm ?? 'N/A'}
- WPM trend: ${typingMetrics?.wpmTrend ?? 'N/A'}
- Backspace/total keystrokes: ${typingMetrics?.backspaceRate != null ? `${(typingMetrics.backspaceRate * 100).toFixed(1)}%` : 'N/A'}
- Avg pause between bursts: ${typingMetrics?.avgPauseMs != null ? `${typingMetrics.avgPauseMs}ms` : 'N/A'}

ACTIVITY LOGS (recent ${activityLog?.length ?? 0} days):
${activityLog?.map(l =>
  `  ${l.date}: mood ${l.mood}/5, focus ${l.focus}/5, ${l.hoursWorked}h worked, ${l.meetings} meetings, ${l.breaks} breaks, ${l.overtime || 0}h overtime`
).join('\n') || '  No logs provided.'}

PRE-COMPUTED LOCAL SCORE: ${localScore ?? 'N/A'}/100`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.55,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Repository info (contributers, language) ──────────────────────────────────
burnoutRouter.post('/github/repo', async (req, res) => {
  const { owner, repo, token } = req.body;
  if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' });

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MindTrace-BurnoutDetector/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!resp.ok) return res.status(resp.status).json({ error: `GitHub ${resp.status}` });
    const data = await resp.json();
    res.json({
      fullName: data.full_name,
      language: data.language,
      stars: data.stargazers_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
