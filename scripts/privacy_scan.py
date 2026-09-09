#!/usr/bin/env python3
"""Fail when a public artifact tree contains common private data."""

from __future__ import annotations

import re
import sys
from pathlib import Path


TEXT_SUFFIXES = {
    "", ".css", ".csv", ".html", ".js", ".json", ".md", ".py", ".txt",
}
WEIGHT_SUFFIXES = {".bin", ".ckpt", ".gguf", ".npz", ".safetensors"}
PATTERNS = {
    "macOS home path": re.compile(rb"/Users/[^/\s\"']+"),
    "Windows user path": re.compile(rb"[A-Za-z]:\\\\Users\\\\[^\\\\\s\"']+"),
    "local account marker": re.compile(rb"(?i)Users-[A-Za-z0-9._-]+"),
    "email address": re.compile(rb"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b"),
    "Hugging Face token": re.compile(rb"\bhf_[A-Za-z0-9]{12,}\b"),
    "OpenAI-style secret": re.compile(rb"\bsk-[A-Za-z0-9_-]{12,}\b"),
    "GitHub token": re.compile(rb"\b(?:ghp_|github_pat_)[A-Za-z0-9_]{12,}\b"),
    "AWS access key": re.compile(rb"\bAKIA[A-Z0-9]{16}\b"),
    "private IPv4": re.compile(
        rb"\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b"
    ),
    "UUID/session identifier": re.compile(
        rb"(?i)(?:session[_ -]?id.{0,10})?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
    ),
}


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    findings: list[str] = []
    count = 0
    for path in sorted(root.rglob("*")):
        if not path.is_file() or ".git" in path.parts:
            continue
        count += 1
        rel = path.relative_to(root)
        if path.suffix.lower() in WEIGHT_SUFFIXES:
            findings.append(f"model-weight file: {rel}")
            continue
        if path.name.startswith(".") and path.name != ".gitignore":
            findings.append(f"unexpected hidden file: {rel}")
        if path.suffix.lower() not in TEXT_SUFFIXES:
            findings.append(f"unexpected binary/type: {rel}")
            continue
        data = path.read_bytes()
        # The scanner source necessarily contains the signatures it searches
        # for. Other structural checks above still apply to that file.
        if rel.as_posix() != "scripts/privacy_scan.py":
            for label, pattern in PATTERNS.items():
                if pattern.search(data):
                    findings.append(f"{label}: {rel}")
    if findings:
        print("PRIVACY SCAN FAILED")
        for finding in findings:
            print(f"- {finding}")
        return 1
    print(f"PASS ({count} files scanned; no configured private-data pattern found)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
