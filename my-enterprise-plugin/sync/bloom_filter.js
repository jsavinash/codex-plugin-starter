'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MAGIC = Buffer.from('ENTBLM1\0', 'ascii');
const HEADER_BYTES = 20;
const FILTER_PATH = path.join(__dirname, 'bloom_filter.bin');

function digest64(label, value) {
  return crypto.createHash('sha256').update(`${label}:${value}`, 'utf8').digest().readBigUInt64BE(0);
}

function loadFilter(filePath = FILTER_PATH) {
  const data = fs.readFileSync(filePath);
  if (data.length < HEADER_BYTES || !data.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('invalid enterprise Bloom filter header');
  }
  const bitCount = data.readUInt32BE(8);
  const hashCount = data.readUInt32BE(12);
  const itemCount = data.readUInt32BE(16);
  const byteCount = Math.ceil(bitCount / 8);
  if (bitCount < 8 || hashCount < 1 || hashCount > 32 || data.length !== HEADER_BYTES + byteCount) {
    throw new Error('invalid enterprise Bloom filter dimensions');
  }
  return { bitCount, hashCount, itemCount, bits: data.subarray(HEADER_BYTES) };
}

function containsSha256(value, filePath = FILTER_PATH) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new TypeError('sha256 must contain exactly 64 hexadecimal characters');
  }
  const filter = loadFilter(filePath);
  if (filter.itemCount === 0) return false;
  const h1 = digest64('h1', value.toLowerCase());
  const h2 = digest64('h2', value.toLowerCase()) | 1n;
  for (let index = 0; index < filter.hashCount; index += 1) {
    const bit = Number((h1 + BigInt(index) * h2) % BigInt(filter.bitCount));
    if ((filter.bits[Math.floor(bit / 8)] & (1 << (bit % 8))) === 0) return false;
  }
  return true;
}

module.exports = { MAGIC, HEADER_BYTES, FILTER_PATH, loadFilter, containsSha256 };
