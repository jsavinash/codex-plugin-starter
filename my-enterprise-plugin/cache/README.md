# Local cache

This directory is intentionally empty in source control. `schema_snapshots/` may hold non-sensitive, reviewed schema snapshots. Do not put production records, credentials, embeddings derived from personal data, or mutable runtime state into the plugin package.

Use a separate encrypted store with access control, retention, and deletion policies for live enterprise memory. The plugin does not implement a vector database or synchronization client.
