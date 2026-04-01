# Senior Backend Interview — Data Structures & Algorithms (DSA)

---

### Q1. Describe the difference between an Array and a LinkedList. When would you use each?

**Array (ArrayList in Java):**
- Contiguous memory. O(1) random access by index.
- O(n) insert/delete (shifts elements).
- Cache-friendly due to memory locality.
- Use when: frequent reads by index, mostly append operations.

**LinkedList:**
- Scattered nodes in memory. O(n) access by index.
- O(1) insert/delete *if you have the node reference*.
- Higher memory overhead (each node stores data + pointers).
- Use when: frequent insertions/deletions in the middle. Implement Queues or Stacks.

---

### Q2. How does a HashMap work internally in Java?

O(1) average time for `get()` and `put()`.

**Internal workings:**
1. **Hashing:** `key.hashCode()` → secondary hash → bucket index in the array.
2. **Collision:** Multiple keys in the same bucket form a LinkedList.
3. **Lookup:** Hash to find bucket → `key.equals()` to find the exact entry in the list.
4. **Treeifying (Java 8+):** If a bucket exceeds 8 entries, LinkedList → Red-Black Tree. Worst-case lookup improves from O(n) to O(log n).
5. **Load factor:** Default 0.75. When 75% of buckets are used, the array doubles in size and all entries are rehashed.

**Why you must override both `hashCode()` and `equals()`:**
- `hashCode()` determines the bucket. `equals()` matches the exact key within the bucket.
- If you override `equals()` but not `hashCode()`, two "equal" objects may hash to different buckets.

---

### Q3. Explain the time complexity of common sorting algorithms.

| Algorithm | Average | Worst | Space | Stable? | Notes |
|---|---|---|---|---|---|
| Bubble Sort | O(n²) | O(n²) | O(1) | Yes | Educational only |
| Insertion Sort | O(n²) | O(n²) | O(1) | Yes | Fast for small/nearly sorted |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes | Java's `Arrays.sort()` for Objects |
| Quick Sort | O(n log n) | O(n²) | O(log n) | No | Java's `Arrays.sort()` for primitives |
| Heap Sort | O(n log n) | O(n log n) | O(1) | No | Good worst-case guarantee |

**Stable sort** preserves the relative order of equal elements — important when sorting by multiple criteria (e.g., sort by name then by age).

---

### Q4. What is the difference between a Tree and a Graph? Explain BFS and DFS.

**Tree:** Connected, acyclic graph with a root node. Each node has exactly one parent (except root).
**Graph:** Collection of nodes + edges. Can have cycles, disconnected components, directed/undirected edges.

**BFS (Breadth-First Search):**
- Explores level by level. Uses a **Queue (FIFO)**.
- Finds shortest path in unweighted graphs.
- Time: O(V + E), Space: O(V).

**DFS (Depth-First Search):**
- Explores as deep as possible, then backtracks. Uses a **Stack/recursion**.
- Used for topological sort, cycle detection, connected components.
- Time: O(V + E), Space: O(V).

---

### Q5. What is a Stack and a Queue? Give real-world backend examples.

**Stack (LIFO):** `push()`, `pop()`, `peek()` — all O(1).
- Call stack, undo history, DFS, expression parsing, parentheses matching.

**Queue (FIFO):** `enqueue()`, `dequeue()` — all O(1).
- Message queues (Kafka), task scheduling, BFS, rate limiting request queue.

**Priority Queue (Heap):** O(log n) insert/remove, O(1) peek.
- Task scheduling by priority, Dijkstra's shortest path, load balancer routing.

---

### Q6. What is a Binary Search Tree (BST)?

For every node: left subtree values < node < right subtree values.

```
        8
       / \
      3   10
     / \    \
    1   6   14
```

- Search, Insert, Delete: **O(log n)** average.
- **Degenerate case:** Sorted insertions → becomes a linked list → O(n).
- **Fix:** Self-balancing BSTs:
  - **AVL Tree:** Strict balance (height diff ≤ 1). Faster reads.
  - **Red-Black Tree:** Looser balance. Fewer rotations. Used by Java's `TreeMap`, `TreeSet`.

---

### Q7. Explain Dynamic Programming. How do you identify a DP problem?

**DP** solves problems by breaking them into **overlapping subproblems** and caching results.

**Two properties:**
1. **Optimal Substructure:** Solution is built from sub-solutions.
2. **Overlapping Subproblems:** Same subproblems solved repeatedly.

**Top-Down (Memoization):**
```java
Map<Integer, Long> memo = new HashMap<>();
public long fib(int n) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    long result = fib(n - 1) + fib(n - 2);
    memo.put(n, result);
    return result;
}
```

**Bottom-Up (Tabulation):**
```java
public long fib(int n) {
    if (n <= 1) return n;
    long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

**Common DP problems:** Fibonacci, Climbing Stairs, Coin Change, Knapsack, LCS, LIS.

---

### Q8. Explain the Two Pointers technique.

Two indices traverse a data structure simultaneously to solve problems in **O(n)** instead of O(n²).

**Pattern 1 — Opposite ends (sorted array):**
```java
// Two Sum on sorted array
int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return new int[]{left, right};
    else if (sum < target) left++;
    else right--;
}
```

**Pattern 2 — Fast/Slow (Floyd's Cycle Detection):**
```java
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;  // cycle!
}
```

**Pattern 3 — Sliding Window:**
```java
// Max sum subarray of size k
int windowSum = 0, maxSum = 0;
for (int i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k) windowSum -= arr[i - k];
    if (i >= k - 1) maxSum = Math.max(maxSum, windowSum);
}
```

---

### Q9. What is Big O notation? Explain common complexities.

| Complexity | Name | Example | Feel |
|---|---|---|---|
| O(1) | Constant | HashMap get | Instant |
| O(log n) | Logarithmic | Binary search | Doubling data adds one step |
| O(n) | Linear | Single loop | 2x data = 2x time |
| O(n log n) | Linearithmic | Merge Sort | Optimal sort |
| O(n²) | Quadratic | Nested loops | 2x data = 4x time |
| O(2ⁿ) | Exponential | Recursive Fib | Doubles per +1 input |

**Rules:** Drop constants, drop lower-order terms, different inputs = different variables.

---

### Q10. Solve: Reverse a linked list.

**Iterative (preferred):**
```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
// Time: O(n), Space: O(1)
```

**Walkthrough for `1 → 2 → 3 → null`:**
```
prev=null, curr=1→2→3
prev=1→null, curr=2→3
prev=2→1→null, curr=3
prev=3→2→1→null, curr=null → return
```

---

### Q11. Solve: Find the first non-repeating character in a string.

```java
public char firstNonRepeating(String s) {
    // LinkedHashMap maintains insertion order
    Map<Character, Integer> countMap = new LinkedHashMap<>();
    for (char c : s.toCharArray()) {
        countMap.merge(c, 1, Integer::sum);
    }
    for (Map.Entry<Character, Integer> entry : countMap.entrySet()) {
        if (entry.getValue() == 1) return entry.getKey();
    }
    return '_'; // no non-repeating character
}
// Time: O(n), Space: O(k) where k is the character set size
```

**Why LinkedHashMap?** Regular HashMap doesn't guarantee order. We need to iterate in insertion order to find the *first* non-repeating character.

---

### Q12. Solve: Check if a string has valid parentheses.

Given a string containing `(){}[]`, determine if it is valid (every open bracket has a matching close bracket in the correct order).

```java
public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');

    for (char c : s.toCharArray()) {
        if (pairs.containsValue(c)) {
            stack.push(c);  // opening bracket
        } else if (pairs.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}
// Time: O(n), Space: O(n)
```

**Test cases:**
- `"()"` → true
- `"()[]{}"` → true
- `"(]"` → false
- `"([)]"` → false
- `"{[]}"` → true

---

### Q13. Explain Dijkstra's Algorithm. Where is it used in backend systems?

**Dijkstra's Algorithm** finds the shortest path from a source node to all other nodes in a weighted graph with **non-negative** edge weights.

**Algorithm:**
1. Initialize distances: source = 0, all others = ∞.
2. Use a **Priority Queue (min-heap)**.
3. Process the node with the smallest tentative distance.
4. For each neighbor, if `current_distance + edge_weight < known_distance`, update.
5. Repeat until all nodes are processed.

**Time complexity:** O((V + E) log V) with a binary heap.

**Backend use cases:**
- **Routing engines:** Google Maps, ride-sharing ETAs.
- **Network routing:** Finding the fastest path through network nodes.
- **Dependency resolution:** Package managers finding the optimal dependency graph.
- **Load balancing:** Routing requests to the server with the shortest "distance" (measured by latency, queue depth).

---

### Q14. What is the difference between Recursion and Iteration? When do you prefer each?

| Aspect | Recursion | Iteration |
|---|---|---|
| **Mechanism** | Function calls itself | Loop (`for`, `while`) |
| **Memory** | Uses call stack → O(n) extra space per call depth | O(1) extra space |
| **Risk** | StackOverflowError for deep recursion | No stack risk |
| **Readability** | Often more elegant for tree/graph problems | More straightforward for linear problems |
| **Performance** | Slower due to function call overhead | Faster |

**Prefer recursion when:**
- Tree traversal, graph DFS, divide and conquer
- Problem is naturally recursive (Fibonacci, factorials, merge sort)
- Code readability matters more than micro-optimization

**Prefer iteration when:**
- Performance is critical
- Input size could be very large (risk of StackOverflow)
- Problem is linear in nature (array processing)

**Tail call optimization:** Some languages (not Java) optimize recursive tail calls to avoid stack growth. In Java, always consider iterative alternatives for deep recursion.
