# Database Schema Setup Instructions

## CRITICAL: You MUST apply the database schema before using the new features!

The backend edge functions and frontend UI have been created for:
- **Citizen Reports** - Submit and manage community reports
- **AI Analysis** - Automatic sentiment and threat analysis
- **Verification System** - Review and verify reports with confidence scoring
- **Role-Based Access Control (RBAC)** - Assign roles like verifier, moderator, partner, government
- **Audit Logs** - Complete activity tracking
- **Notifications** - Real-time alerts and updates

## Steps to Apply Schema

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/vyjbsjcybhityldpkyxh

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute the Schema**
   - Open the `DATABASE_SCHEMA.sql` file in this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   After running, you should see these new tables in the Database section:
   - `citizen_reports` - Stores all citizen submissions
   - `verification_tasks` - Tracks verification workflow
   - `ai_analysis_logs` - Stores AI analysis results
   - `audit_logs` - Complete activity audit trail
   - `partner_organizations` - Partner network management
   - `escalation_rules` - Auto-escalation configuration
   - `notifications` - User notifications system
   - `user_roles` - RBAC role assignments

5. **Test the System**
   Once schema is applied, you can:
   - Navigate to `/reports` to submit citizen reports
   - Navigate to `/verification` to verify reports (requires verifier role)
   - Navigate to `/admin` and click "Role Management" to assign roles
   - Edge functions will work automatically (already deployed)

## Edge Functions Available

The following backend functions are ready to use:
- `submit-report` - Validates and creates citizen reports
- `analyze-citizen-report` - AI sentiment/threat analysis
- `assign-verification-task` - Assigns tasks to verifiers
- `complete-verification` - Processes verification results

## Type Errors

The TypeScript errors you see about `citizen_reports` and `verification_tasks` will disappear once:
1. The schema is applied
2. Supabase generates new types (happens automatically)
3. The preview rebuilds (happens automatically)

## Need Help?

If you encounter issues:
1. Check the Supabase logs for SQL errors
2. Verify all tables were created successfully
3. Ensure RLS policies are enabled
4. Check the Database > Tables section in Supabase Dashboard
