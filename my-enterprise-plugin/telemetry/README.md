# Audit and telemetry

The hook records minimal local tool metadata only when `ENTERPRISE_AUDIT_HMAC_KEY` and `PLUGIN_DATA` are available. It does not capture model tokens or every agent action. The OpenTelemetry file is a disabled integration contract; no exporter sends data to Datadog, Splunk, or another endpoint.
