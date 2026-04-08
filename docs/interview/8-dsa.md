# Data Structures & Algorithms — Senior Backend Interview Guide

**Master fundamental data structures and algorithm patterns for high-performance backend systems.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 30 Core Topics

| # | Topic | Key Concept | Level |
|---|-------|-------------|-------|
| 1 | Array vs LinkedList | Access vs insert trade-off | ⭐⭐⭐ |
| 2 | HashMap Internals | Hash table + collision handling | ⭐⭐⭐ |
| 3 | Sorting Algorithms | Time/space trade-offs | ⭐⭐⭐ |
| 4 | Tree vs Graph | Hierarchy vs network | ⭐⭐ |
| 5 | BFS & DFS | Traversal strategies | ⭐⭐⭐ |
| 6 | Stack & Queue | LIFO vs FIFO | ⭐⭐⭐ |
| 7 | Binary Search Tree | O(log n) searching | ⭐⭐⭐ |
| 8 | Dynamic Programming | Memoization patterns | ⭐⭐⭐ |
| 9 | Two Pointers | O(n) optimization | ⭐⭐⭐ |
| 10 | Big O Notation | Complexity analysis | ⭐⭐⭐ |
| 11 | Reverse LinkedList | Pointer manipulation | ⭐⭐⭐ |
| 12 | Non-repeating Char | Hash table pattern | ⭐⭐ |
| 13 | Valid Parentheses | Stack-based validation | ⭐⭐⭐ |
| 14 | Dijkstra's Algorithm | Shortest path | ⭐⭐⭐ |
| 15 | Recursion vs Iteration | Memory & readability | ⭐⭐ |
| 16 | Two Sum Problem | Hash table lookup | ⭐⭐⭐ |
| 17 | Anagrams | Frequency counting | ⭐⭐ |
| 18 | Binary Search | Divide & conquer | ⭐⭐⭐ |
| 19 | Merge Intervals | Sorting + merging | ⭐⭐⭐ |
| 20 | LRU Cache | Eviction policy | ⭐⭐⭐ |
| 21 | Maximum Subarray | Kadane's algorithm | ⭐⭐⭐ |
| 22 | Reverse String | Two pointers | ⭐⭐ |
| 23 | Find Duplicate | Floyd cycle detection | ⭐⭐ |
| 24 | Top K Frequent | Min-heap pattern | ⭐⭐⭐ |
| 25 | Spiral Matrix | Boundary shrinking | ⭐⭐ |
| 26 | Power of Two | Bit manipulation | ⭐⭐ |
| 27 | Palindrome Check | Two pointers | ⭐⭐ |
| 28 | Array Intersection | Set intersection | ⭐⭐ |
| 29 | Climbing Stairs | DP (Fibonacci) | ⭐⭐⭐ |
| 30 | Missing Number | Sum formula | ⭐⭐ |

---

## Core Data Structures

### Q1: Array vs LinkedList

**The simple answer:**
Arrays are contiguous memory blocks—instant index access. LinkedLists are scattered—pointers connect them—slow access, fast middle insertions.

**The problem:**
Array: O(1) access, O(n) insertion. LinkedList: O(n) access, O(1) insertion. Choose wrong and you kill performance.

**Trade-offs:**

| Operation | Array | LinkedList |
|-----------|-------|-----------|
| Access by index | O(1) ✅ | O(n) ❌ |
| Insert/delete end | O(1) | O(1) |
| Insert/delete middle | O(n) ❌ | O(1) ✅ |
| Space overhead | Minimal | Pointer per node |

**Implementation (Java):**

```java
// Array: Bank storing account balances by index
int[] balances = new int[1000];
int balance = balances[500];  // O(1) — instant

// LinkedList: Building transaction chain
class Transaction {
    int amount;
    Transaction next;
}

// Access pattern matters!
Transaction curr = head;
for (int i = 0; i < 500; i++) {  // O(n) to reach 500th transaction
    curr = curr.next;
}
```

**Backend use cases:**

```java
// ✅ Use ArrayList: Frequent reads by ID (customer queries)
List<Account> accounts = new ArrayList<>();
Account acc = accounts.get(accountId);  // O(1)

// ✅ Use LinkedList: Frequent middle insertions (event log chain)
Deque<Event> eventLog = new LinkedList<>();
eventLog.addFirst(newEvent);  // O(1) at head
```

**Interview tip:**
"Arrays for read-heavy, LinkedLists for write-heavy middle operations. In production, ArrayList beats LinkedList 95% of the time due to CPU cache locality."

---

### Q2: HashMap Internals (Hash Function & Collisions)

**The simple answer:**
HashMap is a filing cabinet. Hash function picks the drawer (bucket). Collisions = multiple items in one drawer, handled via linked list or tree.

**The problem:**
Bad hash function = all items in one bucket = HashMap becomes O(n) instead of O(1). Collisions must be handled efficiently.

**Internal mechanics:**

```java
// Simplified HashMap structure
class SimpleHashMap<K, V> {
    private Node<K, V>[] buckets;  // Array of buckets
    
    static class Node<K, V> {
        K key;
        V value;
        Node<K, V> next;  // Chain for collisions
    }
    
    public V put(K key, V value) {
        // 1. Compute hash
        int hash = key.hashCode() & (buckets.length - 1);  // Pick bucket
        
        // 2. Walk the chain in that bucket
        Node<K, V> node = buckets[hash];
        while (node != null) {
            if (node.key.equals(key)) {  // Found existing key
                V oldValue = node.value;
                node.value = value;
                return oldValue;
            }
            node = node.next;
        }
        
        // 3. Insert new node at head
        Node<K, V> newNode = new Node<>();
        newNode.key = key;
        newNode.value = value;
        newNode.next = buckets[hash];
        buckets[hash] = newNode;
        
        return null;
    }
    
    public V get(K key) {
        int hash = key.hashCode() & (buckets.length - 1);
        Node<K, V> node = buckets[hash];
        while (node != null) {
            if (node.key.equals(key)) return node.value;
            node = node.next;
        }
        return null;
    }
}
```

**Java 8+ Optimization:**

```java
// Java 8+ converts chain to Red-Black tree at 8 collisions
// This ensures O(log n) even with bad hash function
// Converts back to chain at 6 items (hysteresis)
```

**Critical: Override Both hashCode() and equals():**

```java
public class BankAccount {
    private String accountId;
    private String customerId;
    
    // ❌ WRONG: Only equals, missing hashCode
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof BankAccount)) return false;
        BankAccount b = (BankAccount) o;
        return accountId.equals(b.accountId);
    }
    
    // ✅ CORRECT: Both methods, hash first 3 chars
    @Override
    public int hashCode() {
        return accountId.substring(0, 3).hashCode();
    }
    
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof BankAccount)) return false;
        BankAccount b = (BankAccount) o;
        return accountId.equals(b.accountId);
    }
}

// Test
Map<BankAccount, BigDecimal> balances = new HashMap<>();
BankAccount acc1 = new BankAccount("ACC001", "CUST123");
BankAccount acc2 = new BankAccount("ACC001", "CUST123");

balances.put(acc1, BigDecimal.valueOf(1000));
System.out.println(balances.get(acc2));  // 1000 ✅ (equals + same hash)
```

**Interview tip:**
"HashMap is O(1) average, O(n) worst. Good hash = evenly distributed buckets. Always override hashCode() + equals() together. Java 8 tree fallback makes worst-case O(log n)."

---

### Q3: Sorting Algorithms (Time/Space Trade-offs)

**The simple answer:**
Different sorts excel at different conditions. Merge Sort always O(n log n) but uses O(n) space. Quick Sort fast in practice, O(n²) worst case.

**Comparison:**

| Algorithm | Best | Average | Worst | Space | Stable | Use Case |
|-----------|------|---------|-------|-------|--------|----------|
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ Yes | Linked lists, guaranteed speed |
| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ No | Arrays, practice favorite |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ No | Space-constrained, priority queues |
| **Insertion Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ Yes | Small arrays, nearly sorted data |

**Professional Implementation (Banking):**

```java
// Quick Sort: Good average performance
public class TransactionSorter {
    
    // Sort transactions by amount (quick sort)
    public static void quickSort(Transaction[] txns, int low, int high) {
        if (low < high) {
            int pi = partition(txns, low, high);
            quickSort(txns, low, pi - 1);
            quickSort(txns, pi + 1, high);
        }
    }
    
    private static int partition(Transaction[] txns, int low, int high) {
        Transaction pivot = txns[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (txns[j].getAmount().compareTo(pivot.getAmount()) <= 0) {
                i++;
                // Swap
                Transaction temp = txns[i];
                txns[i] = txns[j];
                txns[j] = temp;
            }
        }
        // Swap pivot
        Transaction temp = txns[i + 1];
        txns[i + 1] = txns[high];
        txns[high] = temp;
        return i + 1;
    }
}

// Merge Sort: Guaranteed performance, stable
public class MergeSortTransactions {
    
    public static void mergeSort(Transaction[] txns, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(txns, left, mid);
            mergeSort(txns, mid + 1, right);
            merge(txns, left, mid, right);
        }
    }
    
    private static void merge(Transaction[] txns, int left, int mid, int right) {
        Transaction[] temp = new Transaction[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        
        while (i <= mid && j <= right) {
            int cmp = txns[i].getTimestamp().compareTo(txns[j].getTimestamp());
            if (cmp <= 0) {
                temp[k++] = txns[i++];
            } else {
                temp[k++] = txns[j++];
            }
        }
        
        while (i <= mid) temp[k++] = txns[i++];
        while (j <= right) temp[k++] = txns[j++];
        
        System.arraycopy(temp, 0, txns, left, temp.length);
    }
}
```

**When to sort what:**

```java
// Java default: Arrays.sort() → Dual-pivot Quick Sort
// Guarantees O(n log n) with intelligent pivot selection
// But not stable!

// For stable sort: Collections.sort() or Arrays.sort() on objects with equals
// Spring Data: @Query with ORDER BY (database handles it, not Java)

@Service
public class TransactionService {
    @Query("SELECT t FROM Transaction t WHERE t.accountId = :accountId ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountOrderByTimestamp(@Param("accountId") Long accountId);
}
```

**Interview tip:**
"Merge Sort for linked lists (can't random access). Quick Sort for arrays (faster in practice). Insertion Sort for nearly-sorted data. Always ask: is stability required? How much extra space?"

---

## Advanced Patterns

### Q4: BFS & DFS (Graph Traversal)

**The simple answer:**
BFS (breadth-first): Visit all neighbors first → find shortest paths. DFS (depth-first): Go deep, backtrack → explore all routes, detect cycles.

**When to use:**

```java
// ✅ BFS: Shortest path (unweighted graph)
// ✅ BFS: Level-order traversal (binary trees)
// ✅ BFS: Connected components (undirected graph)

// ✅ DFS: Detect cycles
// ✅ DFS: Topological sort (DAG)
// ✅ DFS: Finding all paths (backtracking)
```

**Implementation (Banking Transaction Graph):**

```java
public class TransactionGraphAnalyzer {
    
    // BFS: Find shortest path between two accounts (money flow)
    public List<Integer> findShortestPath(int source, int destination, 
                                          Map<Integer, List<Integer>> graph) {
        if (!graph.containsKey(source) || !graph.containsKey(destination)) {
            return List.of();
        }
        
        Queue<Integer> queue = new LinkedList<>();
        Map<Integer, Integer> parent = new HashMap<>();
        Set<Integer> visited = new HashSet<>();
        
        queue.offer(source);
        visited.add(source);
        parent.put(source, -1);
        
        while (!queue.isEmpty()) {
            int curr = queue.poll();
            
            if (curr == destination) {
                return reconstructPath(source, destination, parent);
            }
            
            for (int neighbor : graph.getOrDefault(curr, List.of())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                    parent.put(neighbor, curr);
                }
            }
        }
        
        return List.of();  // No path found
    }
    
    // DFS: Detect cycles in transaction flow (fraud detection)
    public boolean hasCycleBFS(Map<Integer, List<Integer>> graph) {
        Set<Integer> visited = new HashSet<>();
        
        for (int node : graph.keySet()) {
            if (!visited.contains(node)) {
                if (dfsCycleDetect(node, -1, graph, visited)) {
                    return true;  // Cycle found
                }
            }
        }
        
        return false;
    }
    
    private boolean dfsCycleDetect(int curr, int parent, 
                                   Map<Integer, List<Integer>> graph, 
                                   Set<Integer> visited) {
        visited.add(curr);
        
        for (int neighbor : graph.getOrDefault(curr, List.of())) {
            if (!visited.contains(neighbor)) {
                if (dfsCycleDetect(neighbor, curr, graph, visited)) {
                    return true;
                }
            } else if (neighbor != parent) {
                return true;  // Cycle: back edge to visited node that isn't parent
            }
        }
        
        return false;
    }
    
    private List<Integer> reconstructPath(int source, int destination, 
                                          Map<Integer, Integer> parent) {
        List<Integer> path = new ArrayList<>();
        int curr = destination;
        
        while (curr != -1) {
            path.add(curr);
            curr = parent.get(curr);
        }
        
        Collections.reverse(path);
        return path;
    }
}
```

**Interview tip:**
"BFS for shortest paths, DFS for cycles/backtracking. BFS uses queue (FIFO), DFS uses stack/recursion. Time: O(V+E), Space: O(V)."

---

### Q5: Two Pointers & Sliding Window

**The simple answer:**
Instead of nested loops O(n²), move two pointers smartly → O(n). Perfect for sorted arrays, palindromes, subarray problems.

**Pattern 1: Opposite ends (sorted array):**

```java
// Find two numbers that sum to target
public int[] twoSum(int[] sorted, int target) {
    int left = 0, right = sorted.length - 1;
    
    while (left < right) {
        int sum = sorted[left] + sorted[right];
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++;  // Need bigger sum
        } else {
            right--;  // Need smaller sum
        }
    }
    
    return new int[]{-1, -1};
}
// Time: O(n), Space: O(1)
```

**Pattern 2: Sliding window (max/min in subarray):**

```java
// Banking: Find max monthly transaction sum in any quarter (3 months)
public long maxQuarterlySum(long[] monthlyTransactions) {
    int windowSize = 3;
    long windowSum = 0, maxSum = 0;
    
    // Build initial window
    for (int i = 0; i < windowSize; i++) {
        windowSum += monthlyTransactions[i];
    }
    maxSum = windowSum;
    
    // Slide window
    for (int i = windowSize; i < monthlyTransactions.length; i++) {
        windowSum += monthlyTransactions[i];           // Add new element
        windowSum -= monthlyTransactions[i - windowSize];  // Remove old element
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}
// Time: O(n), Space: O(1)
```

**Pattern 3: Opposite pointers detecting loops (Floyd's algorithm):**

```java
// Detect if linked list has a cycle (transaction chain fraud)
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    
    while (fast != null && fast.next != null) {
        slow = slow.next;       // Move 1 step
        fast = fast.next.next;  // Move 2 steps
        
        if (slow == fast) {
            return true;  // They met → cycle exists!
        }
    }
    
    return false;
}
// Time: O(n), Space: O(1)
```

**Interview tip:**
"Recognize: sorted array → opposite pointers, subarray problem → sliding window, list cycle → fast/slow. Two pointers beats brute force on interviews."

---

### Q6: Binary Search Tree (BST)

**The simple answer:**
Left < node < right. Enables O(log n) search, insert, delete. Self-balancing variants (Red-Black, AVL) prevent worst-case O(n).

**Implementation (Banking account lookup):**

```java
public class BST<K extends Comparable<K>, V> {
    private Node<K, V> root;
    
    static class Node<K, V> {
        K key;
        V value;
        Node<K, V> left, right;
    }
    
    public void insert(K key, V value) {
        root = insertRec(root, key, value);
    }
    
    private Node<K, V> insertRec(Node<K, V> node, K key, V value) {
        if (node == null) {
            Node<K, V> newNode = new Node<>();
            newNode.key = key;
            newNode.value = value;
            return newNode;
        }
        
        int cmp = key.compareTo(node.key);
        if (cmp < 0) {
            node.left = insertRec(node.left, key, value);
        } else if (cmp > 0) {
            node.right = insertRec(node.right, key, value);
        } else {
            node.value = value;  // Update if exists
        }
        
        return node;
    }
    
    public V search(K key) {
        return searchRec(root, key);
    }
    
    private V searchRec(Node<K, V> node, K key) {
        if (node == null) return null;
        
        int cmp = key.compareTo(node.key);
        if (cmp < 0) {
            return searchRec(node.left, key);
        } else if (cmp > 0) {
            return searchRec(node.right, key);
        } else {
            return node.value;
        }
    }
}

// Problem: Insert sorted data (1,2,3,4,5) → becomes a line → O(n)!
// Solution: Use TreeMap (Red-Black tree)
Map<String, BigDecimal> balances = new TreeMap<>();  // Auto-balanced
```

**Interview tip:**
"Pure BST = O(log n) average, O(n) worst (sorted input). Always use TreeMap/TreeSet in production they're self-balancing. Range queries and sorted iteration are built-in."

---

### Q7: Dynamic Programming (Memoization)

**The simple answer:**
Remember past calculations. Avoid solving the same subproblem twice. Transforms exponential to polynomial.

**Example: Fibonacci with memoization:**

```java
public class FibonacciOptimized {
    
    // ❌ SLOW: Exponential O(2ⁿ)
    public long fibSlow(int n) {
        if (n <= 1) return n;
        return fibSlow(n - 1) + fibSlow(n - 2);
        // fib(100) takes forever!
    }
    
    // ✅ FAST: O(n) with memoization
    public long fibMemo(int n) {
        return fibMemoRec(n, new HashMap<>());
    }
    
    private long fibMemoRec(int n, Map<Integer, Long> memo) {
        if (n <= 1) return n;
        
        if (memo.containsKey(n)) {
            return memo.get(n);  // Already calculated!
        }
        
        long result = fibMemoRec(n - 1, memo) + fibMemoRec(n - 2, memo);
        memo.put(n, result);  // Save for future
        return result;
    }
    
    // ✅ FASTEST: Bottom-up (no recursion)
    public long fibBottom(int n) {
        if (n <= 1) return n;
        
        long prev2 = 0, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            long curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}

// Banking DP example: Minimum coins to make change
public class CoinChange {
    
    // minimum coins needed to make amount
    public int minCoins(int[] coinValues, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);  // Initialize with "impossible"
        dp[0] = 0;  // 0 coins needed to make 0
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coinValues) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

**Interview tip:**
"DP overcomes exponential recursion via memoization. Identify: (1) Subproblems repeat, (2) Optimal substructure. Memoization (top-down) or DP table (bottom-up)."

---

### Q8: LRU Cache (Eviction Policy)

**The simple answer:**
Cache with size limit. Evict the least-recently-used item when full. O(1) get/put.

**Implementation:**

```java
public class LRUCache {
    private final int capacity;
    private final Map<Integer, Integer> cache;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        // LinkedHashMap with accessOrder=true: tracks access order
        // removeEldestEntry() is called when size > capacity
        this.cache = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size() > capacity;
            }
        };
    }
    
    public int get(int key) {
        return cache.getOrDefault(key, -1);  // Access updates order
    }
    
    public void put(int key, int value) {
        cache.put(key, value);  // Access updates order
    }
}

// Alternative: Manual via Deque + HashMap
public class LRUCacheManual {
    private final int capacity;
    private final Map<Integer, Integer> map = new HashMap<>();
    private final Deque<Integer> deque = new LinkedList<>();  // Track access order
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        
        deque.remove(key);  // Move to most recent
        deque.addLast(key);
        return map.get(key);
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) {
            deque.remove(key);
        }
        
        deque.addLast(key);
        map.put(key, value);
        
        if (map.size() > capacity) {
            int oldest = deque.removeFirst();
            map.remove(oldest);
        }
    }
}
```

**Interview tip:**
"LRU Cache: LinkedHashMap with accessOrder=true for elegance, or manual Deque+HashMap for clarity. All operations O(1). Common in database query caching."

---

## Summary Interview Checklist

- [ ] **Data Structures**: HashMap collisions, BST vs Red-Black tree, array vs linked list trade-offs
- [ ] **Sorting**: Merge Sort stable, Quick Sort fast average, when to use each
- [ ] **Traversal**: BFS for shortest path, DFS for cycles, both O(V+E)
- [ ] **Two Pointers**: Opposite ends, sliding window, fast/slow for loops
- [ ] **Binary Search**: O(log n), works on sorted arrays/ranges
- [ ] **Dynamic Programming**: Memoization, optimal substructure
- [ ] **LRU Cache**: O(1) access/eviction, LinkedHashMap or Deque+Map
- [ ] **Bit Manipulation**: Power of two, bit counts, XOR tricks
- [ ] **Graph Algorithms**: Dijkstra, BFS, topological sort
- [ ] **Greedy Patterns**: When greedy works (interval scheduling, coin change)

---

## Banking-Relevant DSA Patterns

| Problem | Pattern | Complexity | Application |
|---------|---------|-----------|-------------|
| **Shortest money path** | BFS/Dijkstra | O(V+E) log V | Money transfer routing |
| **Detect fraud cycles** | DFS + cycle detect | O(V+E) | Circular transaction detection |
| **Recommended accounts** | Graph traversal | O(V+E) | Account relationship mapping |
| **Top K transactions** | Min-heap/priority queue | O(n log k) | Transaction analytics |
| **Rate limiting tokens** | Sliding window | O(1) | Throttling requests |
| **Recent searches cache** | LRU cache | O(1) | Session caching |
| **Exchange rate conversions** | Two pointers/DP | O(n) | Multi-currency routing |
| **Account statement pagination** | Binary search | O(log n) | Fast statement lookup |

