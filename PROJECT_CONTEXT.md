# Project Context: TradeDev AI Command Center

## Product Context

TradeDev AI Command Center is an AI engineering productivity prototype for Indian capital-market trading software teams. It is positioned as an internal command center that helps engineering, QA, support, release, and compliance technology teams convert scattered incident or release information into structured decisions.

## Domain Context

The product is focused on Indian trading-platform workflows, including NSE/BSE order flow, EQ/NFO/BFO/CDS style segments, RMS validation, broker communication, audit readiness, and SEBI-style traceability.

Important product components represented in the prototype:

- CTCL Manager
- Client Communicator
- Shared Memory SS
- RMS
- NSEInteractive 1 / 2
- Broadcast Manager
- IRIS / REST
- Web Component App
- Audit Trail
- Alerts and Support Console

## Demo Scenario

An Indian broker reports intermittent rejection of NSE F&O algo basket orders after an RMS rule-engine hotfix. Manual NSE equity orders are passing. Logs indicate `RULE_VERSION_MISMATCH`, possible stale state in Shared Memory SS, and missing audit correlation ids.

## AI Workflows

- Change Impact Analyzer
- AI Test Case Generator
- Incident Debug Assistant
- Release Readiness Copilot
- Trading Domain Knowledge Assistant
- Release Pack Generator

## Safety Positioning

The prototype does not provide trading advice, stock recommendations, or live order execution. It uses synthetic data and focuses only on engineering productivity, release quality, incident response, and audit readiness.

## Pitch Line

Make every Indian trading software release faster to understand, safer to validate, and easier to audit.
