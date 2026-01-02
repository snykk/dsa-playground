"""
Coordinate Compression Pattern

Technique to map large coordinate values to smaller indices.
Useful for reducing space complexity when coordinates are sparse.
"""

from typing import List, Dict


def compress_coordinates(coords: List[int]) -> Dict[int, int]:
    """Compress coordinates to 0-indexed mapping."""
    sorted_coords = sorted(set(coords))
    mapping = {coord: idx for idx, coord in enumerate(sorted_coords)}
    return mapping


def decompress_coordinates(mapping: Dict[int, int]) -> List[int]:
    """Decompress mapping back to original coordinates."""
    reverse_mapping = {v: k for k, v in mapping.items()}
    return [reverse_mapping[i] for i in range(len(reverse_mapping))]


def compress_2d_coordinates(points: List[tuple]) -> tuple:
    """Compress 2D coordinates."""
    x_coords = [p[0] for p in points]
    y_coords = [p[1] for p in points]
    x_mapping = compress_coordinates(x_coords)
    y_mapping = compress_coordinates(y_coords)
    return x_mapping, y_mapping


def main():
    """Example usage."""
    print("Coordinate Compression Examples:")
    print()
    coords = [1000, 5, 200, 1000, 5, 50]
    mapping = compress_coordinates(coords)
    print(f"Original: {coords}")
    print(f"Compressed mapping: {mapping}")
    print(f"Decompressed: {decompress_coordinates(mapping)}")

