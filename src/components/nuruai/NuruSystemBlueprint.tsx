import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Shield, Brain, BookOpen, GitBranch, BarChart3, Building2, Search, Globe, MessageSquareText, Lock, Database, Cpu, Users, Eye, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const blueprintSections = [
  {
    id: 'executive',
    title: '1. Executive Summary',
    icon: FileText,
    content: `NuruAI is a world-class civic intelligence infrastructure designed to transform complex public policy documents—budgets, legislation, constitutions, and governmental reports—into accessible, interactive knowledge while facilitating institutional accountability. Operating as a public civic utility within the PeaceVerse platform, NuruAI democratizes access to policy intelligence through AI-powered document analysis, evidence-grounded question answering, and transparent governance mechanisms.

The system is built on a foundation of anti-hallucination guardrails, mandatory source citations, and comprehensive audit trails, ensuring that every AI-generated insight can be traced back to its source material. NuruAI serves citizens, civil society organizations, researchers, journalists, and government institutions across Africa, supporting democratic participation through evidence-based engagement.

Key Design Principles:
• Evidence-First Architecture: Every AI response must cite specific source documents and passages
• Anti-Hallucination Guardrails: Strict prompt engineering prevents fabrication of information
• Democratic Accessibility: Complex policy documents explained in plain language for all literacy levels
• Institutional Accountability: Public archive of government responses and commitments
• Transparency by Design: Full audit trails for all AI interactions and document processing
• Tiered Access Control: Role-based permissions for Citizens, Civil Society, Researchers, and Institutions`,
  },
  {
    id: 'architecture',
    title: '2. System Architecture',
    icon: Cpu,
    content: `2.1 Technology Stack
─────────────────────
• Frontend: React 18 + TypeScript + Vite + Tailwind CSS
• State Management: TanStack React Query v5 (server state), React Context (client state)
• Backend: Supabase (PostgreSQL 15+ with Row Level Security)
• AI Engine: Google Gemini 2.5 Pro (primary), Gemini 2.5 Flash (lightweight tasks)
• Edge Functions: Deno-based serverless functions for AI orchestration
• Authentication: Supabase Auth with JWT-based session management
• Real-time: Supabase Realtime (PostgreSQL Change Data Capture)
• Document Processing: Client-side extraction + server-side AI summarization
• Export: jsPDF, docx.js for structured document generation

2.2 Data Flow Architecture
──────────────────────────
[User Input] → [Frontend Validation] → [Edge Function (JWT Auth)] → [AI Gateway] → [Response Processing] → [Database Persistence] → [Client Cache Update]

All AI interactions follow a strict pipeline:
1. User submits query/document via authenticated frontend
2. Edge function validates JWT token and user permissions
3. Request is routed to AI Gateway (ai.gateway.lovable.dev) with structured prompts
4. AI response is parsed, validated against source documents, and confidence-scored
5. Results are persisted to PostgreSQL with full audit metadata
6. Client receives response and updates local cache via React Query

2.3 Database Schema (Core Tables)
──────────────────────────────────
• nuru_conversations: Multi-turn chat sessions with context windows
• nuru_messages: Individual messages with source citations and confidence scores
• nuru_documents: Uploaded policy documents with processing status
• nuru_document_sections: AI-extracted sections with embeddings
• civic_claim_reviews: Fact-check results with ClaimReview schema
• civic_analytics: Usage metrics and engagement tracking
• ai_governance_registry: Public risk register for AI transparency
• ai_analysis_logs: Complete audit trail of all AI operations
• country_constitutions: National constitution documents with section-level indexing
• nuru_token_usage: Per-user token consumption tracking`,
  },
  {
    id: 'modules',
    title: '3. Feature Modules',
    icon: Brain,
    content: `3.1 AI Deep Chat (NuruQuestionInterface)
─────────────────────────────────────────
Purpose: Multi-turn conversational AI for policy questions
Capabilities:
• ChatGPT-style interface with persistent conversation history
• Context-aware follow-up questions within conversation threads
• Mandatory source citations with confidence scoring (0-100%)
• Language detection and multilingual support (EN, FR, SW, AR)
• Suggested follow-up questions generated from context
• Token usage tracking per user with configurable limits
• Export conversation history as PDF or Markdown
Security: All queries authenticated via JWT; responses never stored without user consent

3.2 Document Intelligence Engine (NuruDocumentLibrary)
──────────────────────────────────────────────────────
Purpose: Upload, process, and analyze policy documents
Capabilities:
• Supports PDF, Word (.docx), Excel (.xlsx), CSV, and plain text
• AI-powered document summarization and key-point extraction
• Automatic section detection and table-of-contents generation
• Document versioning and comparison
• Full-text search across document corpus
• Processing status tracking (pending → processing → completed → error)
• Document access controls with RLS policies
Security: Files validated for type/size; processing via server-side Edge Functions only

3.3 Policy Explorer (NuruPolicyExplorer)
────────────────────────────────────────
Purpose: Interactive section-by-section exploration of legal documents
Capabilities:
• Constitution and legislation viewer with section navigation
• AI-generated plain-language explanations for each section
• "Citizen Impact" analysis showing how provisions affect daily life
• Side-by-side comparison of original text and AI explanation
• Export annotated documents as PDF or Markdown
• Country-specific constitution database with amendment tracking
• Table of contents with search and filter functionality
Security: Read-only access for unauthenticated users; explanations cached to reduce AI costs

3.4 Fact Check / Claim Review (NuruClaimReview)
────────────────────────────────────────────────
Purpose: Verify political claims against official evidence
Capabilities:
• Submit claims for AI-powered verification against document corpus
• Verdict system: Verified True, Mostly True, Misleading, False, Unverifiable
• Evidence summary with supporting and contradicting passages
• Confidence scoring with methodology transparency
• Batch claim processing for journalists and researchers
• ClaimReview schema output (Schema.org standard for search engines)
• Public shareable fact-check reports with unique share tokens
• Moderation queue for reviewing AI-generated verdicts
Security: Claims flagged by authenticated users; verdicts reviewed before public publication

3.5 Public Accountability Archive (NuruAccountabilityArchive)
──────────────────────────────────────────────────────────────
Purpose: Track institutional responses and government commitments
Capabilities:
• Submit concerns to government institutions with evidence attachments
• Track institutional response status (pending → acknowledged → responded)
• Public archive of all submitted concerns and official responses
• Response quality scoring and citizen satisfaction ratings
• Escalation workflows for unanswered concerns
• Timeline view of institutional engagement history
• Statistical dashboard showing response rates by institution
Security: Submission requires authentication; responses verified by institutional accounts

3.6 Democratic Knowledge Graph (NuruKnowledgeGraph)
───────────────────────────────────────────────────
Purpose: Visualize relationships between policies, institutions, and outcomes
Capabilities:
• Interactive force-directed graph visualization
• Node types: Policies, Institutions, People, Outcomes, Regions
• Edge types: Implements, Affects, Funds, Regulates, Oversees
• Search and filter by entity type, region, or policy domain
• Drill-down from graph nodes to source documents
• Export graph data as JSON for external analysis
• Community-contributed relationship suggestions
Security: Graph data derived from verified documents only; suggestions moderated

3.7 Institutional Portal (NuruInstitutionalPortal)
──────────────────────────────────────────────────
Purpose: Dedicated engagement interface for government institutions
Capabilities:
• Institutional dashboard with citizen concern metrics
• Bulk response management for incoming queries
• Analytics on public engagement and sentiment trends
• Template-based response system for common inquiry types
• Document publishing portal for institutional transparency
• Integration with accountability archive for response tracking
• Role-based access: Institution Admin, Responder, Viewer
Security: Institutional accounts verified; responses attributable to specific officials

3.8 Analytics Dashboard (NuruAnalyticsDashboard)
─────────────────────────────────────────────────
Purpose: Comprehensive usage and impact analytics
Capabilities:
• Real-time query volume and user engagement metrics
• Topic trending analysis across all conversations
• Sentiment analysis of citizen queries and concerns
• Geographic distribution of platform usage
• AI model performance metrics (accuracy, latency, confidence)
• Document processing statistics and pipeline health
• Exportable reports for stakeholder briefings
Security: Aggregated metrics only; no individual user data exposed in analytics

3.9 Civic Transparency Portal (NuruCivicTransparency)
─────────────────────────────────────────────────────
Purpose: Public-facing impact dashboard and transparency reports
Capabilities:
• Public statistics on platform usage and citizen engagement
• Impact metrics: questions answered, documents processed, claims verified
• Regional breakdown of civic participation
• Published transparency reports with methodology explanations
• Open data exports for researchers and journalists
• Community trust indicators and platform health metrics
Security: All displayed data is aggregated and anonymized; no PII exposed

3.10 AI Governance Portal (NuruGovernancePortal)
─────────────────────────────────────────────────
Purpose: AI transparency and responsible AI governance
Capabilities:
• Public AI risk register with active mitigation strategies
• Model card information: capabilities, limitations, biases
• Incident reporting for AI errors or harmful outputs
• Governance policy documentation and version history
• Regular audit reports on AI decision-making patterns
• Feedback mechanism for community input on AI behavior
• Compliance tracking against international AI ethics frameworks
Security: Risk register publicly readable; incident reports verified before publication`,
  },
  {
    id: 'security',
    title: '4. Security Architecture',
    icon: Shield,
    content: `4.1 Authentication & Authorization
───────────────────────────────────
• JWT-based authentication via Supabase Auth
• Email/password signup with email verification (no auto-confirm)
• Session management with automatic token refresh
• Role-Based Access Control (RBAC) via dedicated user_roles table
• Roles: citizen, civil_society, researcher, journalist, institution, admin
• Security Definer functions for role checks (prevents RLS recursion)
• No anonymous signups permitted

4.2 Row Level Security (RLS)
────────────────────────────
All database tables enforce RLS policies:
• nuru_conversations: Users can only access their own conversations
• nuru_messages: Scoped to conversation ownership
• nuru_documents: Upload requires auth; public documents readable by all
• civic_claim_reviews: Flagged by auth users; public after moderation
• ai_governance_registry: Public read; admin-only write
• ai_analysis_logs: Admin and verifier access only
• country_constitutions: Public read; admin upload only

4.3 API Security
────────────────
• All Edge Functions validate JWT tokens before processing
• CORS headers configured for authorized origins only
• Rate limiting enforced per user (configurable token limits)
• Input validation: text length limits, file type restrictions, SQL injection prevention
• AI Gateway authenticated via server-side LOVABLE_API_KEY (never exposed to client)
• Request/response logging for security audit trails

4.4 Data Protection
───────────────────
• All data encrypted at rest (AES-256 via Supabase/PostgreSQL)
• TLS 1.3 for all data in transit
• PII minimization: anonymous queries supported
• Data retention policies: audit logs retained for compliance
• No user data shared with AI providers beyond query context
• Secure file upload with type validation and size limits
• Database views with security_invoker = on for safe data exposure

4.5 AI-Specific Security Measures
──────────────────────────────────
• Prompt injection prevention via structured system prompts
• Output validation: AI responses parsed and sanitized before display
• Hallucination detection: confidence scoring below threshold triggers warnings
• Token usage limits prevent abuse and cost overruns
• Model output never directly rendered as HTML (XSS prevention)
• DOMPurify sanitization for any user-generated or AI-generated content
• Rate limiting on AI endpoints (per-user and global)

4.6 Compliance Framework
─────────────────────────
• Designed for ISO/IEC 27001 compliance
• GDPR-aligned data handling practices
• African Union Convention on Cyber Security alignment
• Complete audit trails for all data access and modifications
• Data subject access request (DSAR) support via admin tools`,
  },
  {
    id: 'ai_engine',
    title: '5. AI Engine Specifications',
    icon: Cpu,
    content: `5.1 Model Configuration
───────────────────────
Primary Model: Google Gemini 2.5 Pro
• Use case: Complex reasoning, document analysis, multi-turn conversations
• Context window: 1M+ tokens
• Strengths: Nuanced understanding, long document processing, multilingual

Secondary Model: Google Gemini 2.5 Flash
• Use case: Quick queries, sentiment analysis, classification tasks
• Optimized for: Speed and cost efficiency
• Strengths: Low latency, high throughput

5.2 Prompt Engineering Standards
─────────────────────────────────
All AI interactions use structured prompts with:
• System Role: Defines NuruAI as a civic intelligence assistant
• Anti-Hallucination Directive: "Only cite information from provided documents"
• Source Citation Requirement: "Include specific document titles and sections"
• Confidence Scoring: "Rate confidence 0-100 based on source quality"
• Language Instruction: "Respond in the same language as the query"
• Scope Limitation: "Do not speculate beyond available evidence"
• Output Format: Structured JSON for programmatic processing

5.3 Response Validation Pipeline
──────────────────────────────────
1. JSON parsing and schema validation
2. Source citation verification (cross-reference with document index)
3. Confidence score threshold check (< 40% triggers uncertainty warning)
4. Content safety filtering (hate speech, violence incitement)
5. PII detection and redaction if applicable
6. Response caching for identical queries (cost optimization)

5.4 Token Management
─────────────────────
• Per-user daily/monthly token limits (configurable by admin)
• Real-time usage tracking via nuru_token_usage table
• Tiered limits by user role (citizen < researcher < institution)
• Admin override capability for special circumstances
• Usage analytics dashboard for cost monitoring

5.5 Multi-Language Support
───────────────────────────
Supported languages:
• English (primary)
• French (Francophone Africa)
• Swahili (East Africa)
• Arabic (North/East Africa)
• Portuguese (Lusophone Africa)
• Automatic language detection on input
• Cross-lingual document querying (ask in one language, source in another)`,
  },
  {
    id: 'data_model',
    title: '6. Data Model & Schema',
    icon: Database,
    content: `6.1 Core Entity Relationships
──────────────────────────────
User (auth.users)
 ├── has many → nuru_conversations (multi-turn sessions)
 │    └── has many → nuru_messages (individual messages with citations)
 ├── has many → nuru_documents (uploaded policy documents)
 │    └── has many → nuru_document_sections (extracted sections)
 ├── has many → civic_claim_reviews (fact-check submissions)
 ├── has many → nuru_token_usage (consumption tracking)
 └── has many → user_roles (RBAC assignments)

country_constitutions
 └── has many → constitution_sections (AI-processed article breakdowns)

ai_governance_registry (standalone - public risk register)
ai_analysis_logs (standalone - audit trail)
civic_analytics (standalone - aggregated metrics)

6.2 Key Table Specifications
─────────────────────────────
nuru_conversations:
  • id (UUID, PK), user_id (FK → auth.users), title, model_used
  • context_documents (UUID[]), language, message_count
  • created_at, updated_at, last_message_at

nuru_messages:
  • id (UUID, PK), conversation_id (FK), role (system/user/assistant)
  • content (text), sources (JSONB - cited documents/sections)
  • confidence_score (numeric), tokens_used (integer)
  • created_at

nuru_documents:
  • id (UUID, PK), uploaded_by (FK), title, document_type
  • file_url, original_text, summary, key_points (JSONB)
  • processing_status (pending/processing/completed/error)
  • country, language, word_count, page_count

civic_claim_reviews:
  • id (UUID, PK), claim_text, claim_source, claim_source_url
  • verdict_label, confidence_score, evidence_summary
  • supporting_passages (JSONB), contradicting_evidence (JSONB)
  • claimreview_schema (JSONB - Schema.org format)
  • review_status (pending/reviewed/published/rejected)
  • share_token (unique, for public sharing)
  • flagged_by (FK), reviewed_by (FK)

country_constitutions:
  • id (UUID, PK), country_name (unique), country_code
  • constitution_title, original_text, language
  • processing_status, effective_date, amendment_date
  • uploaded_by (FK), source_url

6.3 Indexing Strategy
──────────────────────
• B-tree indexes on all foreign keys and frequently filtered columns
• GIN indexes on JSONB columns (sources, key_points, fact_check_details)
• Partial indexes on processing_status for active document queries
• Composite indexes on (user_id, created_at) for conversation listing`,
  },
  {
    id: 'edge_functions',
    title: '7. Backend Functions (Edge Functions)',
    icon: Lock,
    content: `7.1 nuru-ai-chat
────────────────
Purpose: Primary AI orchestration endpoint
Actions:
• "chat" - Process user query with document context and conversation history
• "process_constitution" - AI-powered constitution section extraction
• "summarize_document" - Generate document summaries and key points
• "explain_section" - Plain-language explanation of legal text
Authentication: JWT required
Rate Limit: Per-user token limits enforced
Input Validation: Text length < 10,000 chars; document ID verification

7.2 analyze-sentiment
──────────────────────
Purpose: Sentiment and risk analysis for text content
Output: sentiment_score (-1 to 1), emotions[], topics[], risk_indicators
Model: Gemini 2.5 Flash (optimized for speed)
Authentication: JWT required
Caching: Results stored in sentiment_analysis_cache table

7.3 translate-content
──────────────────────
Purpose: Multi-language translation for documents and responses
Supported: EN, FR, SW, AR, PT + auto-detection
Authentication: JWT required
Caching: Translation cache to minimize API calls

7.4 extract-document-text
──────────────────────────
Purpose: Server-side document text extraction
Formats: PDF (via parser), DOCX (XML extraction), CSV/Excel
Output: Raw text + metadata (page count, word count, language)
Authentication: JWT required
Limits: Max file size 10MB

7.5 seed-nuru-demo
───────────────────
Purpose: Populate demo data for demonstrations and testing
Data: Sample documents, conversations, claim reviews, analytics
Authentication: Admin role required
Scope: Non-destructive (inserts only, no deletes)

7.6 generate-ai-report
───────────────────────
Purpose: Generate structured analytical reports
Formats: SITREP, 3W Report, Risk Analysis
Output: Structured JSON for client-side PDF/DOCX generation
Authentication: JWT + elevated role required`,
  },
  {
    id: 'access_control',
    title: '8. Access Control Matrix',
    icon: Users,
    content: `8.1 Role Definitions
─────────────────────
┌──────────────────┬──────────────────────────────────────────────┐
│ Role             │ Description                                  │
├──────────────────┼──────────────────────────────────────────────┤
│ citizen          │ Default role. Basic query and document access │
│ civil_society    │ Extended query limits, batch claim review     │
│ researcher       │ Full document access, analytics export        │
│ journalist       │ Batch fact-checking, priority processing      │
│ institution      │ Institutional portal, bulk response mgmt      │
│ verifier         │ Content verification, moderation access       │
│ admin            │ Full system access, user management           │
└──────────────────┴──────────────────────────────────────────────┘

8.2 Feature Access Matrix
──────────────────────────
┌─────────────────────┬───┬───┬───┬───┬───┬───┬───┐
│ Feature             │ C │ CS│ R │ J │ I │ V │ A │
├─────────────────────┼───┼───┼───┼───┼───┼───┼───┤
│ AI Chat             │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Document Library     │ R │ R │RW │ R │RW │ R │RW │
│ Policy Explorer      │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Fact Check (single)  │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Fact Check (batch)   │ ✗ │ ✓ │ ✓ │ ✓ │ ✗ │ ✓ │ ✓ │
│ Accountability       │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Knowledge Graph      │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Institutional Portal │ ✗ │ ✗ │ ✗ │ ✗ │ ✓ │ ✗ │ ✓ │
│ Analytics Dashboard  │ ✗ │ L │ ✓ │ L │ L │ L │ ✓ │
│ Transparency Portal  │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │
│ Governance Portal    │ R │ R │ R │ R │ R │ R │RW │
│ Constitution Upload  │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✓ │
│ User Management      │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✓ │
│ Token Limit Config   │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✗ │ ✓ │
└─────────────────────┴───┴───┴───┴───┴───┴───┴───┘
Legend: C=Citizen, CS=Civil Society, R=Researcher, J=Journalist,
        I=Institution, V=Verifier, A=Admin
        ✓=Full, ✗=None, R=Read, W=Write, L=Limited`,
  },
  {
    id: 'audit',
    title: '9. Audit & Compliance',
    icon: Eye,
    content: `9.1 Audit Trail Coverage
─────────────────────────
Every significant system action is logged:
• User authentication events (login, logout, failed attempts)
• Document uploads, processing, and access
• AI query submissions and responses
• Fact-check submissions and verdict assignments
• Institutional responses and status changes
• Role assignments and permission changes
• Configuration changes and system updates

9.2 Audit Log Schema
──────────────────────
Each audit entry captures:
• Timestamp (UTC, microsecond precision)
• User ID (authenticated actor)
• Action type (create, read, update, delete, query)
• Resource type and ID
• IP address (for security investigations)
• Request metadata (user agent, session info)
• Before/after state for mutations

9.3 Retention Policy
──────────────────────
• Security audit logs: 7 years (compliance requirement)
• AI interaction logs: 2 years (performance analysis)
• Analytics data: Aggregated after 90 days, raw deleted
• Document versions: Indefinite (legal reference)
• User data: Deleted upon account closure (GDPR right to erasure)

9.4 Compliance Standards
─────────────────────────
• ISO/IEC 27001: Information Security Management
• GDPR: Data protection and privacy (EU standard)
• AU Convention on Cyber Security and Personal Data Protection
• OCHA Information Management Standards
• UN Guiding Principles on Business and Human Rights
• Schema.org ClaimReview: Structured fact-check output standard`,
  },
  {
    id: 'deployment',
    title: '10. Deployment & Operations',
    icon: AlertTriangle,
    content: `10.1 Deployment Architecture
──────────────────────────────
• Frontend: Lovable Cloud (automatic CI/CD from Git)
• Backend: Supabase Cloud (managed PostgreSQL + Edge Functions)
• Edge Functions: Auto-deployed on code push (Deno runtime)
• CDN: Global edge caching for static assets
• DNS: Custom domain with TLS termination

10.2 Environment Configuration
────────────────────────────────
Environment Variables (server-side only):
• SUPABASE_URL: Database connection endpoint
• SUPABASE_SERVICE_ROLE_KEY: Admin-level database access
• LOVABLE_API_KEY: AI Gateway authentication

Client-side (public):
• VITE_SUPABASE_URL: Public API endpoint
• VITE_SUPABASE_PUBLISHABLE_KEY: Anon key for client queries

10.3 Monitoring & Observability
─────────────────────────────────
• Edge Function execution logs (real-time)
• Database query performance metrics
• AI Gateway response time and error rate tracking
• User engagement analytics via civic_analytics table
• Error boundary components for graceful frontend failure handling

10.4 Disaster Recovery
───────────────────────
• Database: Point-in-time recovery (PITR) via Supabase
• Edge Functions: Stateless; auto-redeploy from source
• Documents: Stored in Supabase Storage with redundancy
• Configuration: Infrastructure as code (config.toml)

10.5 Scaling Considerations
─────────────────────────────
• Connection pooling via Supabase (pgbouncer)
• React Query client-side caching reduces API calls by ~60%
• AI response caching for identical queries
• Lazy loading for all page components
• Image optimization and responsive loading`,
  },
  {
    id: 'api_reference',
    title: '11. API Reference Summary',
    icon: GitBranch,
    content: `11.1 Edge Function Endpoints
──────────────────────────────
POST /functions/v1/nuru-ai-chat
  Headers: Authorization: Bearer <JWT>
  Body: { action: "chat", message: string, conversationId?: string, documents?: string[] }
  Response: { response: string, sources: object[], confidence: number, tokensUsed: number }

POST /functions/v1/nuru-ai-chat
  Body: { action: "process_constitution", constitutionId: string }
  Response: { success: boolean, sectionsProcessed: number }

POST /functions/v1/analyze-sentiment
  Headers: Authorization: Bearer <JWT>
  Body: { text: string, contentId?: string, language?: string }
  Response: { analysis: { sentiment_score, sentiment_label, emotions, risk_indicators } }

POST /functions/v1/translate-content
  Headers: Authorization: Bearer <JWT>
  Body: { text: string, targetLanguage: string, sourceLanguage?: string }
  Response: { translatedText: string, detectedLanguage: string }

POST /functions/v1/extract-document-text
  Headers: Authorization: Bearer <JWT>
  Body: { fileUrl: string, documentType: string }
  Response: { text: string, metadata: { pages, words, language } }

11.2 Client SDK Usage
──────────────────────
import { supabase } from "@/integrations/supabase/client";

// Authenticated query
const { data } = await supabase.from('nuru_conversations').select('*').order('updated_at', { ascending: false });

// Edge function invocation
const { data } = await supabase.functions.invoke('nuru-ai-chat', { body: { action: 'chat', message: 'What are my constitutional rights?' } });

// Real-time subscription
supabase.channel('nuru').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nuru_messages' }, callback).subscribe();`,
  },
  {
    id: 'glossary',
    title: '12. Glossary & Definitions',
    icon: BookOpen,
    content: `Term                  | Definition
──────────────────────┼──────────────────────────────────────────────────
Anti-Hallucination    | Prompt engineering techniques preventing AI from fabricating information
ClaimReview           | Schema.org standard for structured fact-check data
Confidence Score      | 0-100% rating of AI's certainty based on source quality
Deep Chat             | Multi-turn conversation with persistent context
Edge Function         | Server-side function running on Deno runtime
JWT                   | JSON Web Token for stateless authentication
Knowledge Graph       | Visual representation of entity relationships
PITR                  | Point-in-Time Recovery for database restoration
RLS                   | Row Level Security - PostgreSQL access control
RBAC                  | Role-Based Access Control
Security Definer      | PostgreSQL function executing with owner privileges
Source Citation        | Reference to specific document and section
Token                 | Unit of AI model input/output measurement
Tiered Access         | Different permission levels based on user role

Document Classification:
• CONFIDENTIAL: Internal system architecture details
• RESTRICTED: Security configurations, API keys, access controls
• PUBLIC: Feature descriptions, transparency reports, civic data`,
  },
];

const NuruSystemBlueprint = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('executive');

  const generatePDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const maxWidth = pageWidth - margin * 2;
      let y = 0;

      const addPage = () => { doc.addPage(); y = margin; };
      const checkPage = (needed: number) => { if (y + needed > pageHeight - 20) addPage(); };

      // ── Cover Page ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pageWidth, 6, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('CONFIDENTIAL — SYSTEM DOCUMENTATION', pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text('NuruAI', pageWidth / 2, 75, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('System Blueprint & Documentation', pageWidth / 2, 90, { align: 'center' });

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 40, 100, pageWidth / 2 + 40, 100);

      doc.setFontSize(11);
      doc.setTextColor(180, 200, 230);
      const subtitle = [
        'Civic Intelligence Infrastructure',
        'Architecture · Security · Features · Compliance',
        '',
        `Version 2.0 — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        '',
        'PeaceVerse Platform',
        'peaceversev2.lovable.app',
      ];
      subtitle.forEach((line, i) => {
        doc.text(line, pageWidth / 2, 115 + i * 8, { align: 'center' });
      });

      doc.setFontSize(8);
      doc.setTextColor(120, 140, 170);
      doc.text('This document contains proprietary and confidential information.', pageWidth / 2, pageHeight - 30, { align: 'center' });
      doc.text('Distribution is restricted to authorized personnel only.', pageWidth / 2, pageHeight - 24, { align: 'center' });

      // ── Table of Contents ──
      addPage();
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Table of Contents', margin, y);
      y += 12;

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.8);
      doc.line(margin, y, margin + 40, y);
      y += 10;

      blueprintSections.forEach((section, idx) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const label = section.title;
        const pageNum = `${idx + 3}`;
        doc.text(label, margin + 4, y);
        doc.text(pageNum, pageWidth - margin, y, { align: 'right' });

        doc.setDrawColor(200, 210, 220);
        doc.setLineWidth(0.1);
        const labelWidth = doc.getTextWidth(label) + margin + 6;
        const numWidth = doc.getTextWidth(pageNum);
        doc.line(labelWidth, y - 1, pageWidth - margin - numWidth - 2, y - 1);
        y += 7;
      });

      // ── Content Sections ──
      blueprintSections.forEach((section) => {
        addPage();

        // Section header
        doc.setFillColor(241, 245, 249);
        doc.rect(0, y - 6, pageWidth, 16, 'F');
        doc.setFillColor(59, 130, 246);
        doc.rect(0, y - 6, 4, 16, 'F');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(section.title, margin + 2, y + 4);
        y += 18;

        // Section content
        doc.setFontSize(8.5);
        doc.setFont('courier', 'normal');
        doc.setTextColor(51, 65, 85);

        const lines = section.content.split('\n');
        lines.forEach((line) => {
          checkPage(5);

          if (line.match(/^[─═┌┐└┘├┤┬┴┼│]/)) {
            doc.setFont('courier', 'normal');
            doc.setTextColor(100, 116, 139);
            const wrapped = doc.splitTextToSize(line, maxWidth);
            doc.text(wrapped, margin, y);
            y += wrapped.length * 3.8;
          } else if (line.match(/^\d+\.\d+\s/) || line.match(/^[A-Z][a-z]+.*:$/)) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 64, 175);
            doc.text(line, margin, y);
            y += 5.5;
            doc.setFontSize(8.5);
          } else if (line.startsWith('•')) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(line, maxWidth - 4);
            doc.text(wrapped, margin + 2, y);
            y += wrapped.length * 3.8;
          } else if (line.trim() === '') {
            y += 2.5;
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(line, maxWidth);
            doc.text(wrapped, margin, y);
            y += wrapped.length * 3.8;
          }
        });
      });

      // ── Footer on all pages ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 160, 175);
        doc.text('NuruAI System Blueprint — CONFIDENTIAL', margin, pageHeight - 8);
        doc.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        doc.setDrawColor(220, 225, 230);
        doc.setLineWidth(0.2);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      }

      doc.save(`NuruAI_System_Blueprint_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('System Blueprint PDF generated successfully');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSection = blueprintSections.find(s => s.id === activeSection);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            System Blueprint & Documentation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive technical documentation for security audits and demonstrations
          </p>
        </div>
        <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isGenerating ? 'Generating...' : 'Download Full PDF'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar navigation */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <ScrollArea className="h-[500px]">
              <div className="space-y-0.5">
                {blueprintSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Content area */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {currentSection && <currentSection.icon className="h-4 w-4 text-primary" />}
                {currentSection?.title}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                <Shield className="h-2.5 w-2.5 mr-1" />
                Confidential
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <ScrollArea className="h-[480px]">
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                {currentSection?.content}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Modules Documented', value: '10', icon: Brain },
          { label: 'Security Controls', value: '24+', icon: Shield },
          { label: 'API Endpoints', value: '6', icon: GitBranch },
          { label: 'Compliance Standards', value: '6', icon: CheckCircle2 },
        ].map((stat) => (
          <Card key={stat.label} className="p-3">
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NuruSystemBlueprint;
