# Development Workflow Protocol
*Created: 2025-08-20*

## Standard Development Process
1. Read current sprint status from d_working_memory/active/current_sprint.md
2. Check project status from d_working_memory/project_status.md
3. Review relevant files in working memory
4. Make changes following existing code patterns
5. Test changes locally
6. Update documentation if needed
7. Commit with descriptive message

## Authentication Development
1. Use existing auth components in /components/auth/
2. Follow patterns in /app/auth/signup/ and /app/auth/login/
3. Check database schema in /lib/db/schema.ts
4. Test with Supabase integration

## Memory System Integration
1. All context saved to memory system automatically
2. Agents process and route content to appropriate memory types
3. Context injection provides relevant information for responses
4. Long-term memories promote from working memory after 7 days

## Deployment Protocol
1. Run tests: npm run test (if available)
2. Run build: npm run build
3. Check for errors and warnings
4. Deploy to Vercel
5. Verify production functionality
