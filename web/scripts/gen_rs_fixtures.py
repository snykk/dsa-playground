"""Generate golden Reed-Solomon fixtures from the repository's Python implementation.

The web visualizer re-implements Reed-Solomon in TypeScript. These fixtures pin it
to the reference implementation in Algorithms/Coding_Theory/Reed_Solomon/Python.
Run from anywhere:

    python3 web/scripts/gen_rs_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/reed-solomon.json. CI regenerates
the file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "Algorithms" / "Coding_Theory" / "Reed_Solomon" / "Python"))

from reed_solomon import DecodeError, ReedSolomon  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "reed-solomon.json"


def make_cases():
    rng = random.Random(20261110)
    cases = []
    for n, k in [(7, 5), (15, 11), (15, 7), (26, 16), (24, 12)]:
        for fcr in (0, 1, 112):
            rs = ReedSolomon(n, k, fcr=fcr)
            nsym = n - k
            for _ in range(8):
                msg = [rng.randrange(256) for _ in range(k)]
                codeword = rs.encode(msg)
                e = rng.randint(0, nsym)
                v = rng.randint(0, (nsym - e) // 2 + 1)  # sometimes one error over budget
                positions = rng.sample(range(n), min(n, e + v))
                erasures = sorted(positions[:e])
                received = list(codeword)
                for p in erasures:
                    received[p] = 0
                for p in positions[e:]:
                    received[p] ^= rng.randrange(1, 256)
                try:
                    decoded, error = rs.decode(received, erasures=erasures), None
                except DecodeError as exc:
                    decoded, error = None, str(exc)
                cases.append(
                    {
                        "n": n,
                        "k": k,
                        "fcr": fcr,
                        "message": msg,
                        "codeword": codeword,
                        "received": received,
                        "erasures": erasures,
                        "within_budget": e + 2 * (len(positions) - e) <= nsym,
                        "decoded": decoded,
                        "error": error,
                    }
                )
    return cases


def main():
    cases = make_cases()
    header = {
        "generator": "web/scripts/gen_rs_fixtures.py",
        "reference": "Algorithms/Coding_Theory/Reed_Solomon/Python/reed_solomon.py",
        "field": "GF(2^8) mod 0x11B, alpha = 3, codeword = [parity | message]",
    }
    lines = [json.dumps(c, separators=(",", ":")) for c in cases]
    body = json.dumps(header)[:-1] + ', "cases": [\n' + ",\n".join(lines) + "\n]}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    print(f"wrote {len(cases)} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
