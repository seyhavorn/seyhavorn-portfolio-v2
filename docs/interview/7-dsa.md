# Senior Backend Interview — Data Structures & Algorithms (DSA)

---

### Q1. What is the difference between an Array and a LinkedList?

**Array** is like a row of boxes next to each other in memory.
- You can jump to any box instantly by its position (index). → O(1) access.
- But if you want to insert/remove something in the middle, you need to shift everything after it. → O(n).

**LinkedList** is like a chain — each piece knows where the next piece is.
- You can't jump to the 5th item directly. You have to follow the chain from the start. → O(n) access.
- But if you're already at a spot, inserting/removing is just changing pointers. → O(1).

**When to use what:**
- **Array:** You read data a lot (by index). Most operations are at the end (add/remove last).
- **LinkedList:** You insert/delete a lot in the middle. You build queues or stacks.

---

### Q2. How does a HashMap work internally in Java?

Think of it like a filing cabinet with numbered drawers.

1. You give it a **key** (e.g., "John").
2. Java calculates a number from the key using `hashCode()` → e.g., 42.
3. It uses that number to pick a **drawer** (bucket) → e.g., drawer #42.
4. It puts your key-value pair in that drawer.

**What if two keys land in the same drawer?** (collision)
- They form a small list inside that drawer.
- When you search, Java finds the drawer first, then checks each item using `equals()` to find the exact match.

**Java 8 optimization:** If one drawer gets more than 8 items, the list turns into a tree (Red-Black Tree) — so searching inside becomes faster: O(log n) instead of O(n).

**Why override both hashCode() and equals()?**
- `hashCode()` → picks the drawer.
- `equals()` → finds the exact item inside the drawer.
- If you only override `equals()`, two "equal" objects might go to different drawers, and you'll never find them.

---

### Q3. What are the common sorting algorithms and their speed?

| Algorithm | Speed (average) | Speed (worst) | Extra Memory | Keeps Order? |
|---|---|---|---|---|
| Bubble Sort | O(n²) | O(n²) | O(1) | Yes |
| Insertion Sort | O(n²) | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(1) | No |

**Simple explanation:**
- **Bubble Sort:** Compare neighbors, swap if wrong order. Repeat until sorted. Slow but simple.
- **Merge Sort:** Split the list in half, sort each half, merge them back. Always fast, but uses extra memory.
- **Quick Sort:** Pick a "pivot", put smaller items left, bigger items right. Repeat. Usually the fastest in practice.

**"Keeps Order" (Stable)** means: if two items are equal, they stay in their original order. This matters when you sort by multiple fields (e.g., sort by name, then by age).

---

### Q4. What is a Tree vs a Graph? What is BFS and DFS?

**Tree:** Like a family tree. One root at the top, branches going down. No loops. Each child has exactly one parent.

**Graph:** Like a road map. Cities (nodes) connected by roads (edges). Can have loops, one-way roads, or disconnected areas.

**BFS (Breadth-First Search):** Explore level by level — like ripples in water.
- Uses a **Queue** (first in, first out).
- Good for finding the **shortest path**.
- Example: "What's the closest restaurant?" → check all nearby places first, then farther ones.

**DFS (Depth-First Search):** Go as deep as possible, then come back and try another path.
- Uses a **Stack** (or recursion).
- Good for exploring all possibilities, detecting cycles.
- Example: "Is there a path from A to Z?" → keep going forward until stuck, then backtrack.

---

### Q5. What is a Stack and a Queue?

**Stack (LIFO — Last In, First Out):**
Think of a stack of plates. You put a plate on top, and take from the top.
- `push()` → put on top
- `pop()` → take from top
- All O(1)
- **Used in:** undo/redo, browser back button, DFS, checking matching brackets.

**Queue (FIFO — First In, First Out):**
Think of a line at a coffee shop. First person in line gets served first.
- `enqueue()` → join the back
- `dequeue()` → leave from the front
- All O(1)
- **Used in:** message queues (Kafka, RabbitMQ), BFS, print job scheduling.

**Priority Queue:**
Like a hospital emergency room — the most urgent patient gets treated first, not whoever arrived first.
- Insert: O(log n), Remove highest priority: O(log n)
- **Used in:** task scheduling, Dijkstra's algorithm, load balancing.

---

### Q6. What is a Binary Search Tree (BST)?

A tree where for every node: **left children < node < right children**.

```
        8
       / \
      3   10
     / \    \
    1   6   14
```

- To find 6: Start at 8 → 6 < 8, go left → 3 → 6 > 3, go right → found!
- Search/Insert/Delete: **O(log n)** on average.

**Problem:** If you insert sorted data (1, 2, 3, 4, 5), it becomes a straight line (like a linked list) → O(n) speed.

**Solution — Self-balancing trees:**
- **AVL Tree:** Strictly balanced. Great for lots of reads.
- **Red-Black Tree:** Less strictly balanced, fewer rotations. Java uses this for `TreeMap` and `TreeSet`.

---

### Q7. What is Dynamic Programming (DP)?

DP is about **not solving the same problem twice**. If you've already calculated something, save the answer and reuse it.

**When to use DP:**
1. The problem can be broken into smaller problems (subproblems).
2. The same subproblems appear again and again.

**Example — Fibonacci:** `fib(5) = fib(4) + fib(3)`, but `fib(4) = fib(3) + fib(2)` — notice `fib(3)` is calculated twice!

**Approach 1 — Top-Down (save as you go):**
```java
Map<Integer, Long> memo = new HashMap<>();
public long fib(int n) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);  // already solved? return it
    long result = fib(n - 1) + fib(n - 2);
    memo.put(n, result);  // save for later
    return result;
}
```

**Approach 2 — Bottom-Up (build from smallest):**
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

**Common DP problems:** Fibonacci, Climbing Stairs, Coin Change, Knapsack, Longest Common Subsequence.

---

### Q8. What is the Two Pointers technique?

Instead of checking every possible pair (O(n²)), use two pointers that move smartly → O(n).

**Pattern 1 — Start from both ends (sorted array):**
```java
// Find two numbers that add up to target
int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return new int[]{left, right};  // found!
    else if (sum < target) left++;   // need bigger sum → move left forward
    else right--;                     // need smaller sum → move right backward
}
```

**Pattern 2 — Fast and Slow (detect a loop):**
```java
// Like two runners on a track — if there's a loop, the fast one catches up
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;       // moves 1 step
    fast = fast.next.next;  // moves 2 steps
    if (slow == fast) return true;  // they met → there's a loop!
}
```

**Pattern 3 — Sliding Window:**
```java
// Find max sum of any 3 consecutive numbers
int windowSum = 0, maxSum = 0;
for (int i = 0; i < arr.length; i++) {
    windowSum += arr[i];             // add new element to window
    if (i >= k) windowSum -= arr[i - k];  // remove old element from window
    if (i >= k - 1) maxSum = Math.max(maxSum, windowSum);
}
```

---

### Q9. What is Big O notation?

Big O tells you **how much slower** your code gets as the input grows.

| Big O | Name | What it means | Example |
|---|---|---|---|
| O(1) | Constant | Same speed no matter the size | Get item from HashMap |
| O(log n) | Logarithmic | Doubling data adds just 1 step | Binary search |
| O(n) | Linear | 2x data = 2x time | Loop through a list |
| O(n log n) | Linearithmic | Best possible sorting speed | Merge Sort |
| O(n²) | Quadratic | 2x data = 4x time | Two nested loops |
| O(2ⁿ) | Exponential | Adding 1 item doubles the time | Recursive Fibonacci without memo |

**Simple rules:**
- Ignore constants: O(2n) → O(n)
- Keep the biggest term: O(n² + n) → O(n²)
- Different inputs = different variables: O(n × m), not O(n²)

---

### Q10. Reverse a linked list.

**Idea:** Walk through the list. At each node, flip its arrow to point backward instead of forward.

```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;    // nothing behind us
    ListNode curr = head;    // start at the beginning
    while (curr != null) {
        ListNode next = curr.next;  // save the next node (so we don't lose it)
        curr.next = prev;           // flip the arrow backward
        prev = curr;                // move prev forward
        curr = next;                // move curr forward
    }
    return prev;  // prev is now the new head
}
// Time: O(n), Space: O(1)
```

**Step by step for `1 → 2 → 3`:**
```
Step 1: null ← 1    2 → 3     (flipped 1's arrow)
Step 2: null ← 1 ← 2    3     (flipped 2's arrow)
Step 3: null ← 1 ← 2 ← 3     (flipped 3's arrow) → done!
```

---

### Q11. Find the first non-repeating character in a string.

**Idea:** Count how many times each character appears, then find the first one with count = 1.

```java
public char firstNonRepeating(String s) {
    // LinkedHashMap remembers the order we added things
    Map<Character, Integer> countMap = new LinkedHashMap<>();
    for (char c : s.toCharArray()) {
        countMap.merge(c, 1, Integer::sum);  // count each character
    }
    for (Map.Entry<Character, Integer> entry : countMap.entrySet()) {
        if (entry.getValue() == 1) return entry.getKey();  // first one with count 1
    }
    return '_';  // no non-repeating character found
}
// Time: O(n), Space: O(1) — at most 26 letters
```

**Example:** `"aabcbd"` → counts: a=2, b=2, c=1, d=1 → answer: `'c'` (first with count 1)

**Why LinkedHashMap?** Regular HashMap doesn't remember order. We need to find the *first* character, so order matters.

---

### Q12. Check if parentheses are valid.

**Idea:** Use a stack. When you see an opening bracket, push it. When you see a closing bracket, check if it matches the last opening bracket.

```java
public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');

    for (char c : s.toCharArray()) {
        if (pairs.containsValue(c)) {
            stack.push(c);  // opening bracket → push to stack
        } else if (pairs.containsKey(c)) {
            // closing bracket → check if it matches the last opening
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;  // no match!
            }
        }
    }
    return stack.isEmpty();  // stack should be empty if all matched
}
```

**Example:**
- `"{[]}"` → push `{`, push `[`, pop `[` matches `]`, pop `{` matches `}` → ✅
- `"(]"` → push `(`, pop `(` doesn't match `]` → ❌
- `"([)]"` → push `(`, push `[`, pop `[` doesn't match `)` → ❌

---

### Q13. What is Dijkstra's Algorithm?

**Dijkstra's** finds the shortest path from one point to all other points in a map with distances.

**Think of it like this:** You're at home, and you want to find the shortest drive to every place in town.

1. Start at home. Distance to home = 0. Distance to everywhere else = infinity.
2. Look at all places you can reach from here. Update their distances if this route is shorter.
3. Move to the unvisited place with the **smallest distance**.
4. Repeat until you've visited everywhere.

**Speed:** O((V + E) log V) — where V = places, E = roads.

**Real-world backend uses:**
- **Google Maps / ride-sharing:** Finding fastest routes.
- **Network routing:** Sending data through the fastest path.
- **Load balancing:** Routing requests to the least-busy server.

---

### Q14. Recursion vs Iteration — What's the difference?

| | Recursion | Iteration |
|---|---|---|
| **How** | Function calls itself | Uses a loop (for, while) |
| **Memory** | Each call uses stack memory | Just one loop, minimal memory |
| **Risk** | StackOverflow if too deep | No stack risk |
| **Readability** | Often cleaner for trees/graphs | Better for simple loops |

**Use recursion when:** The problem is naturally tree-like — tree traversal, DFS, divide and conquer.

**Use iteration when:** The problem is linear (process a list), or the input could be very large.

**Example — Factorial:**
```java
// Recursion: 5! = 5 × 4! = 5 × 4 × 3! = ...
int factorialRecursive(int n) {
    if (n <= 1) return 1;
    return n * factorialRecursive(n - 1);
}

// Iteration: just multiply in a loop
int factorialIterative(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}
```

---

### Q15. Two Sum — Find two numbers that add up to a target.

**Idea:** For each number, check if the number you need to reach the target has already appeared.

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();  // number → its index
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];  // what number do we need?
        if (seen.containsKey(need)) {
            return new int[]{seen.get(need), i};  // found it!
        }
        seen.put(nums[i], i);  // remember this number and its index
    }
    throw new IllegalArgumentException("No solution");
}
// Time: O(n), Space: O(n)
```

**Example:** nums = `[2, 7, 11, 15]`, target = 9
- i=0: num=2, need=7, not seen → save {2:0}
- i=1: num=7, need=2, seen! → return [0, 1] ✅

**Why not two nested loops?** That's O(n²). HashMap lookup is O(1), so total is O(n).

---

### Q16. Check if two strings are anagrams.

**Anagram** = same letters, different order. "listen" → "silent"

**Idea:** Count the letters in both strings. If the counts match, they're anagrams.

```java
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;  // different length → no
    int[] count = new int[26];  // one counter for each letter a-z
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;  // add for string s
        count[t.charAt(i) - 'a']--;  // subtract for string t
    }
    for (int c : count) {
        if (c != 0) return false;  // if any counter is not zero → not anagram
    }
    return true;
}
// Time: O(n), Space: O(1)
```

**How it works:** If `s` has two 'a's and `t` has two 'a's, the counter for 'a' goes +2 then -2 = 0. If all counters are 0, it's an anagram.

---

### Q17. Binary Search — Find a number in a sorted array.

**Idea:** Like guessing a number between 1-100. Each guess, someone says "higher" or "lower". You always guess the middle → you find it in ~7 guesses instead of 100.

```java
public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;  // find the middle
        if (nums[mid] == target) return mid;         // found it!
        else if (nums[mid] < target) left = mid + 1;  // target is bigger → search right half
        else right = mid - 1;                          // target is smaller → search left half
    }
    return -1;  // not found
}
// Time: O(log n), Space: O(1)
```

**Why `left + (right - left) / 2`?** Using `(left + right) / 2` can cause integer overflow when both numbers are very large. This formula avoids that.

---

### Q18. Merge Overlapping Intervals.

**Idea:** Sort intervals by start time. Then walk through them — if the current interval overlaps with the previous one, merge them. Otherwise, start a new group.

```java
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);  // sort by start time
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : intervals) {
        // no overlap → add as new interval
        if (merged.isEmpty() || merged.getLast()[1] < interval[0]) {
            merged.add(interval);
        } else {
            // overlap → extend the end time
            merged.getLast()[1] = Math.max(merged.getLast()[1], interval[1]);
        }
    }
    return merged.toArray(new int[0][]);
}
// Time: O(n log n) because of sorting
```

**Example:** `[1,3], [2,6], [8,10], [15,18]`
- [1,3] + [2,6] → overlap (3 >= 2) → merge to [1,6]
- [1,6] + [8,10] → no overlap (6 < 8) → keep separate
- Result: `[1,6], [8,10], [15,18]`

---

### Q19. Design an LRU Cache (Least Recently Used).

**What is LRU?** A cache with a size limit. When it's full, throw out the item that hasn't been used for the longest time.

**Think of it like a bookshelf with 3 slots:**
- When you read a book, put it at the front.
- When the shelf is full and you get a new book, remove the one at the back (least recently used).

```java
public class LRUCache {
    private final int capacity;
    private final Map<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        // accessOrder = true means: every time you access an item, it moves to the end
        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > capacity;  // auto-remove oldest when full
            }
        };
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
    }
}
// All operations: O(1)
```

**Why LinkedHashMap?** It remembers the order of access. With `accessOrder = true`, every `get()` or `put()` moves the item to the end. The oldest (least used) item stays at the front and gets auto-removed.

---

### Q20. Maximum Subarray Sum (Kadane's Algorithm).

**Problem:** Find the contiguous subarray with the largest sum.

**Idea:** Walk through the array. At each number, ask yourself: "Is it better to start fresh from here, or add this to what I already have?"

```java
public int maxSubArray(int[] nums) {
    int maxSum = nums[0];        // best sum we've found so far
    int currentSum = nums[0];    // sum of current subarray
    for (int i = 1; i < nums.length; i++) {
        // Either start a new subarray at nums[i], or extend the current one
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        // Update the best sum if current is better
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
// Time: O(n), Space: O(1)
```

**Example:** `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`
- At 4: currentSum = 4 (start fresh, because -2+1-3 = -4, adding 4 gives 0, but 4 alone is better)
- At -1: currentSum = 4 + -1 = 3
- At 2: currentSum = 3 + 2 = 5
- At 1: currentSum = 5 + 1 = 6 ← maximum!
- Answer: **6** (from subarray `[4, -1, 2, 1]`)

---

### Q21. Reverse a string in-place.

**Idea:** Swap first and last characters, then move inward.

```java
public void reverseString(char[] s) {
    int left = 0, right = s.length - 1;
    while (left < right) {
        // swap
        char temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        // move inward
        left++;
        right--;
    }
}
// Time: O(n), Space: O(1)
```

**Example:** `['h','e','l','l','o']`
- Swap h ↔ o → `['o','e','l','l','h']`
- Swap e ↔ l → `['o','l','l','e','h']`
- Middle reached → done! ✅

---

### Q22. Find the duplicate number in an array (without extra space).

**Given:** Array of n+1 numbers where each number is between 1 and n. Exactly one duplicate exists.

**Idea (Floyd's Cycle Detection):** Treat the array like a linked list. `nums[i]` tells you the next index to visit. Since there's a duplicate, two paths will lead to the same index → that creates a loop. Find where the loop starts = the duplicate.

```java
public int findDuplicate(int[] nums) {
    int slow = nums[0], fast = nums[0];
    // Step 1: Find where slow and fast meet (inside the loop)
    do {
        slow = nums[slow];          // move 1 step
        fast = nums[nums[fast]];    // move 2 steps
    } while (slow != fast);
    // Step 2: Find the entrance of the loop (= the duplicate)
    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];  // both move 1 step now
        fast = nums[fast];
    }
    return slow;
}
// Time: O(n), Space: O(1)
```

**Simple alternative (if you can use extra space):**
```java
Set<Integer> seen = new HashSet<>();
for (int n : nums) {
    if (!seen.add(n)) return n;  // add() returns false if already exists
}
```

---

### Q23. Find the Top K most frequent elements.

**Idea:** Count how many times each number appears, then keep only the K most frequent ones using a min-heap of size K.

```java
public int[] topKFrequent(int[] nums, int k) {
    // Step 1: Count frequency of each number
    Map<Integer, Integer> freq = new HashMap<>();
    for (int n : nums) freq.merge(n, 1, Integer::sum);

    // Step 2: Use a min-heap of size k
    // The smallest frequency is always on top → easy to remove
    PriorityQueue<Integer> heap = new PriorityQueue<>(
        Comparator.comparingInt(freq::get)
    );
    for (int key : freq.keySet()) {
        heap.offer(key);
        if (heap.size() > k) heap.poll();  // remove the least frequent
    }
    return heap.stream().mapToInt(i -> i).toArray();
}
// Time: O(n log k), Space: O(n)
```

**Example:** nums = `[1,1,1,2,2,3]`, k = 2
- Frequencies: {1:3, 2:2, 3:1}
- Heap keeps the top 2: {1, 2} → answer: `[1, 2]`

**Why min-heap?** We want to keep the biggest K items. A min-heap lets us quickly throw away the smallest one when we have more than K.

---

### Q24. Spiral Matrix — Read matrix elements in spiral order.

**Idea:** Walk the border of the matrix in a spiral: right → down → left → up, then shrink the border and repeat.

```java
public List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> result = new ArrayList<>();
    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        // Go right across top row
        for (int i = left; i <= right; i++) result.add(matrix[top][i]);
        top++;
        // Go down right column
        for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
        right--;
        // Go left across bottom row (if still valid)
        if (top <= bottom) {
            for (int i = right; i >= left; i--) result.add(matrix[bottom][i]);
            bottom--;
        }
        // Go up left column (if still valid)
        if (left <= right) {
            for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
            left++;
        }
    }
    return result;
}
```

**Think of it like peeling an onion** — you walk the outer layer, remove it, then walk the next layer inward.

---

### Q25. Check if a number is a power of two.

**Idea:** A power of 2 in binary has only one `1` bit. Subtract 1 flips that bit and all after. AND-ing gives 0.

```java
public boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}
```

**How it works:**
- `8` = `1000` in binary. `8 - 1` = `0111`. AND: `1000 & 0111` = `0000` → power of 2 ✅
- `6` = `0110` in binary. `6 - 1` = `0101`. AND: `0110 & 0101` = `0100` → not 0 → ❌

**Simple alternative:**
```java
return n > 0 && (n == 1 || n == 2 || n == 4 || ...); // but this doesn't scale
// Or: keep dividing by 2
while (n > 1) { if (n % 2 != 0) return false; n /= 2; } return n == 1;
```

---

### Q26. Check if a string is a palindrome.

**Palindrome** = reads the same forward and backward (ignoring spaces and punctuation).

**Idea:** Two pointers from both ends. Skip non-letter characters. Compare.

```java
public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        // skip non-letters/digits
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
        // compare (case-insensitive)
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
```

**Example:** `"A man, a plan, a canal: Panama"` → remove non-letters → `"amanaplanacanalpanama"` → reads same both ways ✅

---

### Q27. Find common elements in two arrays.

**Idea:** Put all elements from the first array into a Set. Then check which elements from the second array exist in that Set.

```java
public int[] intersection(int[] nums1, int[] nums2) {
    Set<Integer> set1 = new HashSet<>();
    for (int n : nums1) set1.add(n);       // remember all numbers from array 1
    Set<Integer> result = new HashSet<>();
    for (int n : nums2) {
        if (set1.contains(n)) result.add(n);  // if it's also in array 1, keep it
    }
    return result.stream().mapToInt(i -> i).toArray();
}
// Time: O(n + m), Space: O(n)
```

**Example:** nums1 = `[1,2,2,1]`, nums2 = `[2,2]` → answer: `[2]`

---

### Q28. Climbing Stairs — How many ways to reach step N (1 or 2 steps at a time)?

**Idea:** To get to step N, you either came from step N-1 (1 step) or step N-2 (2 steps). So: `ways(N) = ways(N-1) + ways(N-2)`. This is just Fibonacci!

```java
public int climbStairs(int n) {
    if (n <= 2) return n;  // 1 step → 1 way, 2 steps → 2 ways
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
// Time: O(n), Space: O(1)
```

**Example for n=4:**
- Step 1: 1 way → `[1]`
- Step 2: 2 ways → `[1+1, 2]`
- Step 3: 3 ways → `[1+1+1, 1+2, 2+1]`
- Step 4: 5 ways → `[1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2]`

---

### Q29. Find the missing number.

**Given:** Array of numbers from 0 to n, but one number is missing. Find it.

**Idea:** Calculate what the total sum should be (0+1+2+...+n). Subtract the actual sum. The difference is the missing number.

```java
public int missingNumber(int[] nums) {
    int n = nums.length;
    int expectedSum = n * (n + 1) / 2;  // formula for sum 0 to n
    int actualSum = 0;
    for (int num : nums) actualSum += num;
    return expectedSum - actualSum;
}
// Time: O(n), Space: O(1)
```

**Example:** nums = `[3, 0, 1]` → n=3 → expected = 3×4/2 = 6 → actual = 3+0+1 = 4 → missing = **2**

---

### Q30. Rotate an array to the right by K steps.

**Idea:** Use the "reverse trick" — reverse the whole array, then reverse the first K elements, then reverse the rest.

```java
public void rotate(int[] nums, int k) {
    k %= nums.length;  // if k is bigger than the array, wrap around
    reverse(nums, 0, nums.length - 1);  // reverse everything
    reverse(nums, 0, k - 1);           // reverse first k
    reverse(nums, k, nums.length - 1); // reverse the rest
}

private void reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}
// Time: O(n), Space: O(1)
```

**Example:** `[1, 2, 3, 4, 5, 6, 7]`, k=3
1. Reverse all: `[7, 6, 5, 4, 3, 2, 1]`
2. Reverse first 3: `[5, 6, 7, 4, 3, 2, 1]`
3. Reverse last 4: `[5, 6, 7, 1, 2, 3, 4]` ✅

**Why does this work?** Reversing all puts the right elements in the right "half", but they're backwards. Reversing each half fixes the order.
