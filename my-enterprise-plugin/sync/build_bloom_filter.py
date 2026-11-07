#!/usr/bin/env python3
"""Build the package's local Bloom filter from an admin-supplied SHA-256 feed."""

import argparse
import hashlib
import math
from pathlib import Path
import struct

MAGIC = b"ENTBLM1\0"
HEADER = struct.Struct(">8sIII")


def locations(value: str, bit_count: int, hash_count: int):
    h1 = int.from_bytes(hashlib.sha256(f"h1:{value}".encode()).digest()[:8], "big")
    h2 = int.from_bytes(hashlib.sha256(f"h2:{value}".encode()).digest()[:8], "big") | 1
    return ((h1 + index * h2) % bit_count for index in range(hash_count))


def build(values: list[str], requested_bits: int, hash_count: int) -> bytes:
    hashes = sorted({item.strip().lower() for item in values if item.strip()})
    if any(len(item) != 64 or any(char not in "0123456789abcdef" for char in item) for item in hashes):
        raise ValueError("every feed entry must be a 64-character hexadecimal SHA-256 digest")
    bit_count = max(8, requested_bits, math.ceil(len(hashes) * 12))
    bits = bytearray(math.ceil(bit_count / 8))
    for item in hashes:
        for bit in locations(item, bit_count, hash_count):
            bits[bit // 8] |= 1 << (bit % 8)
    return HEADER.pack(MAGIC, bit_count, hash_count, len(hashes)) + bytes(bits)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hashes", type=Path, help="newline-delimited trusted SHA-256 feed; omit to build an empty filter")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("bloom_filter.bin"))
    parser.add_argument("--bits", type=int, default=8192)
    parser.add_argument("--hash-count", type=int, default=7)
    args = parser.parse_args()
    if args.bits < 8 or args.hash_count < 1 or args.hash_count > 32:
        parser.error("--bits must be >= 8 and --hash-count must be between 1 and 32")
    values = args.hashes.read_text(encoding="utf-8").splitlines() if args.hashes else []
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(build(values, args.bits, args.hash_count))
    print(f"Wrote {len([item for item in values if item.strip()])} supplied hash entries to {args.output}")
    if not values:
        print("The filter is empty and will match no known indicators until populated from a trusted feed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
