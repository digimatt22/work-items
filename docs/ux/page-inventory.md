# Page Inventory

| Route | Purpose | Primary actor | Current state | Gaps |
| --- | --- | --- | --- | --- |
| `/` | Entry redirect | All | Redirects signed-in users to `/work-items`, unauthenticated users to `/sign-in` | No documented client-user landing decision |
| `/sign-in` | Sign in | All | Product-facing credential form | No error feedback or pending state |
| `/work-items` | Global board and list | Admin, client user | Implemented board, list, filters, create form for admins | No loading/error state, no card metadata counts, no client-user-specific copy |
| `/clients` | Client portfolio | Admin, client user | Implemented portfolio, project hierarchy, create forms for admins | Destructive Archive lacks confirmation |
| `/clients/[clientId]` | Client detail | Admin, client user | Projects, context, activity, client users, inline edit controls; board link opens `/work-items` with client filter | Direct Prisma mutations, no dedicated structured-context editor |
| `/projects/[projectId]` | Project workspace | Admin, client user | Project context, inline edit controls, work summary; board link opens `/work-items` with project filter | No comments/assets/activity preview at project level |
| `/work-items/[workItemId]` | Work item detail | Admin, client user | Summary, comments, single upload, assets | No edit/status controls, no activity, no type-specific detail display, no error recovery |
| `/workspaces` | Compatibility redirect | Legacy | Redirects to `/clients` per plan | Should be removed or documented before launch |
| `/mvp-review` | Compatibility redirect | Legacy | Redirect retained per plan | Should be removed or documented before launch |

## Missing Pages Or Surfaces
- Admin AI audit surface for Phase 2.
- MCP token/client management surface for Phase 2.
- Search results surface for Phase 2.
- Settings or profile surface.
- Error pages for permission denied, not found, and failed mutation.
- Upload preview/download surface.
