# Spark-X2.5 Hard-50 + Claude Code game artifacts

This repository contains the compact public artifact set from a local
Spark-X2.5-1.7B 4-bit MLX experiment:

- [`problems/leetcode-hard-50.json`](problems/leetcode-hard-50.json): 50
  collected Hard problem records with public statement text, constraints,
  Python signatures, source URLs, local tests, and the scored agent prompt.
- [`problems/index.csv`](problems/index.csv): a browsable ID/title/URL index.
- [`benchmark/`](benchmark/): the compact result summary and per-problem CSV.
- [`game/`](game/): the dependency-free “Spark 星尘收集” browser game.
- [`game/generation-prompt.md`](game/generation-prompt.md): the actual sanitized
  system/user prompts and an explicit repair/provenance note.

## Run the game

```bash
cd game
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. Use arrow keys or WASD to move; touch control is
also supported.

## Experiment result

The Hard-50 run passed 6/50 local fixed test suites after 230 attempts, used
617,995 measured tokens, and reached 1.898 GB peak MLX memory. See
[`benchmark/README.md`](benchmark/README.md) for scope and limitations.

The broader experiment report is published in
[Hugging Face Discussion #21](https://huggingface.co/XHToken/Spark-X2.5-1.7B/discussions/21),
and the bounty context is
[Spark-X2.5 Issue #3](https://github.com/XHToken/Spark-X2.5/issues/3).

## Data and attribution

Problem statements and LeetCode names remain subject to LeetCode's terms and
their respective rights. They are included here for research reproducibility,
with a source URL in every record. This project is not affiliated with or
endorsed by LeetCode.

## Privacy

The repository intentionally excludes model weights, credentials, user names,
email addresses, device names, home-directory paths, session identifiers,
private hosts, caches, and raw application logs. Run
`python3 scripts/privacy_scan.py .` to repeat the public-content scan.
