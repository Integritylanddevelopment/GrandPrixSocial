# 🏁 CLAUDE BOOT-UP CONTEXT - GRAND PRIX SOCIAL
*Last Updated: 2025-08-19*

## 🎯 INSTANT CONTEXT LOAD
You are working on **Grand Prix Social** - an F1 fan platform with:
- **Tech Stack**: Next.js, TypeScript, Supabase, Tailwind CSS v4
- **Database**: Supabase (temporary) → Own cloud (future)
- **Memory Location**: `D:\ActiveProjects\GrandPrixSocial\memory\`

## 🏗️ CURRENT PROJECT STATE
- **Status**: Pre-launch development
- **Priority**: Get MVP launched for user signups
- **Auth**: Separate /auth/signup and /auth/login pages (working)
- **Design**: Glass morphism, gradient backgrounds, F1 theme colors

## 🧠 MEMORY ARCHITECTURE
```
memory/
├── CLAUDE.md (YOU ARE HERE - READ THIS FIRST!)
├── a_memory_core/        → Agent orchestration
├── b_long_term_memory/   → User profiles, historical data
├── c_short_term_memory/  → Recent chats, sessions
├── d_working_memory/     → Active development (1 week persist)
├── e_procedural/         → F1 rules, race procedures
├── f_semantic/           → F1 knowledge base
└── g_episodic/          → User interactions, race history
```

## 📍 QUICK ACCESS PATHS
- **Current Work**: `d_working_memory/active/current_sprint.md`
- **Project Status**: `d_working_memory/project_status.md`
- **User Data Sync**: `b_long_term_memory/user_sync/`
- **Session History**: `c_short_term_memory/sessions/`

## 🎮 KEY AGENTS
1. **Memory Orchestrator**: Coordinates all memory operations
2. **Context Router**: Routes data to correct memory type
3. **Working Memory Agent**: Manages week-long sessions

## 🚦 LAUNCH CHECKLIST
- [x] Authentication system
- [x] Database schema
- [ ] Email verification
- [ ] Landing page optimization
- [ ] Social sharing setup
- [ ] Analytics integration
- [ ] Production deployment

## 💡 REMEMBER
- Keep Supabase for now (quick launch)
- Memory system is file-based (not in git)
- Focus on MVP features only
- User data duplicates: Supabase (live) + Memory (context)

## 🔗 RELATED FILES
- Project root: `D:\ActiveProjects\GrandPrixSocial\`
- Last session: Check `d_working_memory/active/`
- User schemas: `lib/db/schema.ts`

---
*Boot sequence: Read this → Check working memory → Continue development*