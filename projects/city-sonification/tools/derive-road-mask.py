"""Derive a transparent road-surface mask from the generated road image."""

import binascii
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "roads-southeast.png"
TARGET = ROOT / "assets" / "road-surface-mask.png"


def read_png(path):
    payload = path.read_bytes()
    assert payload[:8] == b"\x89PNG\r\n\x1a\n"
    pos = 8
    chunks = []
    while pos < len(payload):
        length = struct.unpack(">I", payload[pos:pos + 4])[0]
        kind = payload[pos + 4:pos + 8]
        body = payload[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, depth, color_type, _, _, interlace = struct.unpack(">IIBBBBB", body)
            assert (depth, color_type, interlace) == (8, 2, 0)
        elif kind == b"IDAT":
            chunks.append(body)
        elif kind == b"IEND":
            break

    raw = zlib.decompress(b"".join(chunks))
    stride = width * 3
    rows = []
    previous = bytearray(stride)
    offset = 0
    for _ in range(height):
        filter_type = raw[offset]
        encoded = raw[offset + 1:offset + 1 + stride]
        offset += stride + 1
        row = bytearray(stride)
        for i, value in enumerate(encoded):
            left = row[i - 3] if i >= 3 else 0
            above = previous[i]
            upper_left = previous[i - 3] if i >= 3 else 0
            if filter_type == 0:
                result = value
            elif filter_type == 1:
                result = (value + left) & 255
            elif filter_type == 2:
                result = (value + above) & 255
            elif filter_type == 3:
                result = (value + ((left + above) // 2)) & 255
            elif filter_type == 4:
                estimate = left + above - upper_left
                distances = (abs(estimate - left), abs(estimate - above), abs(estimate - upper_left))
                predictor = (left, above, upper_left)[distances.index(min(distances))]
                result = (value + predictor) & 255
            else:
                raise ValueError(f"Unsupported PNG filter: {filter_type}")
            row[i] = result
        rows.append(row)
        previous = row
    return width, height, rows


def write_png(path, width, height, alpha):
    rows = b"".join(b"\x00" + bytes(sum(([255, 255, 255, value] for value in row), [])) for row in alpha)
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", binascii.crc32(kind + body) & 0xffffffff)
    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(rows, 9)) + chunk(b"IEND", b""))


width, height, rows = read_png(SOURCE)
mask = []
for row in rows:
    current = []
    for i in range(0, len(row), 3):
        red, green, blue = row[i:i + 3]
        luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
        chroma = max(red, green, blue) - min(red, green, blue)
        current.append(255 if (luminance < 145 and chroma < 58) or (luminance < 105 and chroma < 82) else 0)
    mask.append(current)

# Widen the detected asphalt slightly so the flow remains continuous over lane markings.
for _ in range(4):
    expanded = [row[:] for row in mask]
    for y in range(height):
        for x in range(width):
            if mask[y][x]:
                for yy in range(max(0, y - 1), min(height, y + 2)):
                    for xx in range(max(0, x - 1), min(width, x + 2)):
                        expanded[yy][xx] = 255
    mask = expanded

write_png(TARGET, width, height, mask)
print(f"wrote {TARGET} ({width}x{height})")
