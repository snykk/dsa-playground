"""
Amortized Analysis Implementation and Examples

Amortized analysis provides the average performance of each operation
in the worst case over a sequence of operations.

Unlike worst-case analysis which considers each operation in isolation,
amortized analysis considers the cost of a sequence of operations.

Methods:
1. Aggregate Method: Total cost divided by number of operations
2. Accounting Method: Assign credits to operations
3. Potential Method: Use potential function
"""


class DynamicArray:
    """
    Dynamic Array with amortized O(1) append operation.
    
    Although individual append operations may be O(n) when resizing,
    the amortized cost per operation is O(1).
    """
    
    def __init__(self, initial_capacity=4):
        self.capacity = initial_capacity
        self.size = 0
        self.data = [None] * initial_capacity
        # Total number of element copies made by all resizes so far.
        self.copies = 0
    
    def append(self, value):
        """
        Append operation with amortized O(1) complexity.
        
        Worst case: O(n) when resizing
        Amortized: O(1) per operation
        """
        if self.size >= self.capacity:
            # Resize: O(n) operation
            self._resize()
        
        self.data[self.size] = value
        self.size += 1
    
    def _resize(self):
        """Double the capacity when array is full."""
        old_capacity = self.capacity
        self.capacity = max(1, self.capacity * 2)
        new_data = [None] * self.capacity
        
        # Copy old data: O(n)
        for i in range(old_capacity):
            new_data[i] = self.data[i]
        self.copies += old_capacity
        
        self.data = new_data
    
    def get(self, index):
        """O(1) access operation."""
        if 0 <= index < self.size:
            return self.data[index]
        raise IndexError("Index out of range")


class BinaryCounter:
    """
    Binary Counter with amortized O(1) increment operation.
    
    Although individual increments may flip many bits (O(log n)),
    the amortized cost per increment is O(1).
    """
    
    def __init__(self, n_bits=8):
        self.bits = [0] * n_bits
        self.n_bits = n_bits
        # Total number of bit flips made by all increments so far.
        self.flips = 0
    
    def increment(self):
        """
        Increment operation with amortized O(1) complexity.
        
        Worst case: O(log n) when all bits flip
        Amortized: O(1) per operation
        """
        i = 0
        while i < self.n_bits and self.bits[i] == 1:
            self.bits[i] = 0
            self.flips += 1
            i += 1
        
        if i < self.n_bits:
            self.bits[i] = 1
            self.flips += 1
    
    def get_value(self):
        """Get decimal value of binary counter."""
        value = 0
        for i, bit in enumerate(self.bits):
            value += bit * (2 ** i)
        return value


def aggregate_method_example():
    """
    Aggregate Method: Calculate total cost, then divide by operations.
    
    Example: Dynamic array with n append operations
    - Total cost: O(n) for appends + O(n) for resizing = O(n)
    - Amortized cost per operation: O(n) / n = O(1)
    """
    print("=== Aggregate Method Example ===\n")
    
    arr = DynamicArray()
    operations = 10
    
    print(f"Performing {operations} append operations:")
    for i in range(operations):
        arr.append(i)
        print(f"  Append {i}: size={arr.size}, capacity={arr.capacity}")
    
    print(f"\nAmortized cost: O(1) per append")
    print(f"Explanation: total cost O(n) / {operations} operations = O(1)\n")


def accounting_method_example():
    """
    Accounting Method: charge every append a fixed amortized cost of 3 credits.

    An append that does not resize really costs 1 (the write); it banks the other
    2 credits. A resize append really costs the copies plus 1 (its own write); the
    bank pays for the copies. The bank must never go negative.
    """
    print("=== Accounting Method Example ===\n")
    
    arr = DynamicArray(initial_capacity=2)
    charge = 3
    bank = 0
    total_actual = 0
    
    print("Append operations with credit accounting (charge = 3 per append):")
    for i in range(8):
        copies_before = arr.copies
        arr.append(i)
        actual_cost = 1 + (arr.copies - copies_before)  # own write + copies
        total_actual += actual_cost
        bank += charge - actual_cost
        kind = "RESIZE" if arr.copies > copies_before else "normal"
        print(f"  Append {i}: {kind} (actual={actual_cost}, charged={charge}, bank={bank})")
    
    print(f"\nTotal actual cost: {total_actual} (n writes + {arr.copies} copies)")
    print(f"Total charged: {charge * 8}; amortized cost: {charge} per operation")
    print(f"Actual cost per operation: {total_actual / 8:.2f} (never above {charge})")
    print("Explanation: the bank stays >= 0, so 3 credits per append always pay the real cost\n")


def potential_method_example():
    """
    Potential Method: Use potential function to measure "stored energy".
    
    Example: Dynamic array
    - Potential = 2 * size - capacity
    - When potential is high, resize is "paid for" by potential
    """
    print("=== Potential Method Example ===\n")
    
    arr = DynamicArray(initial_capacity=2)
    
    def potential(arr):
        """Potential function: 2 * size - capacity"""
        return 2 * arr.size - arr.capacity
    
    print("Append operations with potential analysis:")
    prev_potential = potential(arr)
    
    for i in range(8):
        old_capacity = arr.capacity
        arr.append(i)
        
        curr_potential = potential(arr)
        delta_potential = curr_potential - prev_potential
        
        if arr.capacity > old_capacity:
            actual_cost = old_capacity + 1  # Resize + append
            amortized_cost = actual_cost + delta_potential
            print(f"  Append {i}: RESIZE (actual={actual_cost}, amortized={amortized_cost:.2f})")
        else:
            actual_cost = 1
            amortized_cost = actual_cost + delta_potential
            print(f"  Append {i}: normal (actual={actual_cost}, amortized={amortized_cost:.2f})")
        
        prev_potential = curr_potential
    
    print("\nExplanation: Potential function accounts for future expensive operations\n")


def binary_counter_example():
    """
    Binary counter increment has amortized O(1) complexity.
    
    Although incrementing from 0111...111 to 1000...000 flips all bits,
    the amortized cost is O(1) per increment.
    """
    print("=== Binary Counter Amortized Analysis ===\n")
    
    counter = BinaryCounter(n_bits=4)
    
    print("Increment operations:")
    for i in range(10):
        old_value = counter.get_value()
        counter.increment()
        new_value = counter.get_value()
        bits = ''.join(str(b) for b in reversed(counter.bits))
        print(f"  {i+1}. {old_value} -> {new_value} (binary: {bits})")
    
    print("\nAmortized cost: O(1) per increment")
    print("Explanation: Total bit flips for n increments is O(n)\n")


def demonstrate_amortized_analysis():
    """
    Demonstrate amortized analysis with various examples.
    """
    print("=" * 60)
    print("AMORTIZED ANALYSIS EXAMPLES")
    print("=" * 60)
    print()
    
    aggregate_method_example()
    accounting_method_example()
    potential_method_example()
    binary_counter_example()
    
    print("=" * 60)
    print("KEY INSIGHTS")
    print("=" * 60)
    print("1. Amortized analysis considers sequences of operations")
    print("2. Expensive operations are 'paid for' by cheap ones")
    print("3. Amortized cost provides average performance guarantee")
    print("4. Common examples: Dynamic arrays, binary counters, splay trees")


if __name__ == "__main__":
    demonstrate_amortized_analysis()

