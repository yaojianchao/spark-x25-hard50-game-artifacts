# Hard-50 benchmark result

The 4-bit Spark-X2.5-1.7B model attempted 50 LeetCode problems classified as
Hard when the set was collected on 2026-09-09. Each problem allowed up to five
attempts. Failed attempts returned the local test error and prior code to the
next turn. MLX-LM used `max_tokens=-1`; no scored turn ended because of a
4096/8192/32768 output-token cap.

| Metric | Result |
|---|---:|
| Passed local fixed tests | 6/50 (12.0%) |
| Passed on first attempt | 5/50 |
| Added by repair attempts | 1 |
| Total attempts | 230 |
| Input / output / total tokens | 344,354 / 273,641 / 617,995 |
| Mean / median / P95 task latency | 69.08 / 34.59 / 247.03 s |
| Measured benchmark wall time | 3,359.10 s |
| Peak MLX memory | 1.898 GB |

These figures report **local fixed-test accuracy**, not LeetCode acceptance.
No solution was submitted to LeetCode, and the small local test suites are
weaker than the platform's hidden judge.
