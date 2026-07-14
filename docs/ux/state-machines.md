# State Machines

## Work Item Lifecycle
```text
Reported -> In Progress -> In Review -> Done
```

Current implementation:
- Statuses are data-driven through `PipelineStatus`.
- Back/Advance assumes statuses can be ordered by `sortOrder`.
- Direct status select allows non-linear movement for admins.

Recommended constraints:
- Keep non-linear movement allowed for admins unless a future workflow policy says otherwise.
- Record before/after status labels in activity metadata.
- Define whether `Done` can move backward and whether archived items are excluded from status movement.

## Work Item Record State
```text
Draft form -> Created -> Active -> Done -> Archived
```

Known gaps:
- Draft state is local form-only.
- Work item archive UI is not visible.
- Edit state is not implemented.
- Activity is not shown on item detail.

## Asset State
```text
Selected -> Validating -> Uploading -> Attached -> Failed
```

Current implementation:
- Browser file input selects one file.
- Server validates after submit.
- Failure likely surfaces as a generic server-action error.

Recommended next state behavior:
- Show accepted constraints before selection.
- Validate size/type before submit when possible.
- Display failed state inline with retry.

## Comment State
```text
Composing -> Submitting -> Posted -> Failed
```

Current implementation:
- Native required validation covers empty body.
- No pending, success, or failed state is shown.

Recommended next state behavior:
- Disable duplicate submit during pending.
- Preserve comment text on failure.
- Show posted author and timestamp.

## Client User State
```text
Invited/Created -> Active -> Deleted
```

Current implementation:
- Admin creates and deletes users directly.
- No confirmation, deactivation, or audit behavior is documented in the UI.

Open question:
- Should launch support hard delete, soft deactivate, or archive for client users?

