-- Seed DSA Patterns
INSERT INTO dsa_patterns (name, description, difficulty_range, display_order) VALUES
  ('Sliding Window', 'Use a window that slides over data to find a subarray/substring meeting a condition', 'Easy-Hard', 1),
  ('Two Pointers', 'Use two pointers moving toward each other or in the same direction', 'Easy-Medium', 2),
  ('Fast & Slow Pointers', 'Detect cycles or find middle of linked lists using two speed pointers', 'Easy-Medium', 3),
  ('Merge Intervals', 'Merge or insert overlapping intervals', 'Medium', 4),
  ('Cyclic Sort', 'Sort numbers in a range by placing each number at its correct index', 'Easy-Medium', 5),
  ('In-place Reversal', 'Reverse linked list nodes without extra space', 'Easy-Medium', 6),
  ('Tree BFS', 'Level-order traversal of trees using a queue', 'Easy-Medium', 7),
  ('Tree DFS', 'Depth-first traversal patterns for trees', 'Easy-Hard', 8),
  ('Two Heaps', 'Use a min-heap and max-heap together', 'Medium-Hard', 9),
  ('Subsets', 'Generate all subsets/permutations/combinations', 'Medium', 10),
  ('Modified Binary Search', 'Binary search on sorted or rotated arrays', 'Easy-Hard', 11),
  ('Bitwise XOR', 'Use XOR to find missing/duplicate numbers', 'Easy-Medium', 12),
  ('Top K Elements', 'Find top K largest/smallest using a heap', 'Medium', 13),
  ('K-way Merge', 'Merge K sorted arrays/lists', 'Hard', 14),
  ('Dynamic Programming', 'Break problems into overlapping subproblems', 'Medium-Hard', 15),
  ('Backtracking', 'Explore all possibilities and backtrack on failure', 'Medium-Hard', 16),
  ('Trie', 'Prefix tree for efficient string operations', 'Medium', 17),
  ('Monotonic Stack', 'Use a stack that maintains monotonic order', 'Medium', 18),
  ('Graph Traversal', 'BFS/DFS on graphs for shortest path, connectivity', 'Medium-Hard', 19),
  ('Union Find', 'Disjoint set union for grouping connected components', 'Medium', 20)
ON CONFLICT (name) DO NOTHING;

-- Seed Problems (sample set)
INSERT INTO problems (title, slug, description, difficulty, pattern_id, acceptance_rate, company_tags) VALUES
  -- Sliding Window
  ('Maximum Sum Subarray of Size K', 'max-sum-subarray-k', 'Given an array of integers and a number k, find the maximum sum of any subarray of size k.', 'Easy', 1, 72.5, ARRAY['Amazon', 'Microsoft']),
  ('Longest Substring Without Repeating', 'longest-substring-no-repeat', 'Given a string, find the length of the longest substring without repeating characters.', 'Medium', 1, 33.8, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Minimum Size Subarray Sum', 'min-size-subarray-sum', 'Find the minimal length of a contiguous subarray whose sum >= target.', 'Medium', 1, 44.1, ARRAY['Amazon']),
  ('Longest Repeating Character Replacement', 'longest-repeating-char-replacement', 'Replace at most k characters; find the longest substring with all same letters.', 'Medium', 1, 51.2, ARRAY['Google']),
  ('Permutation in String', 'permutation-in-string', 'Return true if s2 contains a permutation of s1.', 'Medium', 1, 44.6, ARRAY['Facebook', 'Microsoft']),
  -- Two Pointers
  ('Two Sum II Input Sorted', 'two-sum-ii', 'Find two numbers that add up to target in a sorted array.', 'Easy', 2, 59.2, ARRAY['Amazon', 'Apple']),
  ('Remove Duplicates from Sorted Array', 'remove-duplicates-sorted', 'Remove duplicates in-place from sorted array and return new length.', 'Easy', 2, 51.3, ARRAY['Microsoft', 'Adobe']),
  ('Squaring a Sorted Array', 'squares-sorted-array', 'Return sorted array of squares given sorted array with negative numbers.', 'Easy', 2, 71.4, ARRAY['Google', 'Amazon']),
  ('3Sum', 'three-sum', 'Find all unique triplets in array that give sum zero.', 'Medium', 2, 32.4, ARRAY['Amazon', 'Facebook', 'Adobe']),
  ('Container With Most Water', 'container-most-water', 'Find two lines that together with x-axis form a container holding the most water.', 'Medium', 2, 54.1, ARRAY['Amazon', 'Google']),
  -- Tree BFS
  ('Binary Tree Level Order Traversal', 'binary-tree-level-order', 'Return the level order traversal of a binary tree as list of lists.', 'Medium', 7, 65.3, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  ('Minimum Depth of Binary Tree', 'min-depth-binary-tree', 'Find the minimum depth of a binary tree (root to nearest leaf).', 'Easy', 7, 43.6, ARRAY['Amazon']),
  ('Maximum Depth of Binary Tree', 'max-depth-binary-tree', 'Find the maximum depth of a binary tree.', 'Easy', 7, 73.5, ARRAY['LinkedIn', 'Amazon']),
  ('Right View of Binary Tree', 'binary-tree-right-view', 'Return the values of the nodes you can see from the right side.', 'Medium', 7, 61.2, ARRAY['Facebook', 'Amazon']),
  -- Tree DFS
  ('Path Sum', 'path-sum', 'Does the tree have a root-to-leaf path such that adding up all values equals targetSum?', 'Easy', 8, 47.3, ARRAY['Amazon', 'Microsoft']),
  ('All Paths for a Sum', 'all-paths-for-sum', 'Find all root-to-leaf paths where sum equals targetSum.', 'Medium', 8, 56.4, ARRAY['Amazon', 'Facebook']),
  ('Diameter of Binary Tree', 'diameter-binary-tree', 'Find the length of the diameter (longest path between any two nodes).', 'Easy', 8, 57.2, ARRAY['Facebook', 'Amazon']),
  -- Dynamic Programming
  ('Fibonacci Number', 'fibonacci-number', 'Calculate the nth Fibonacci number.', 'Easy', 15, 68.1, ARRAY['Amazon', 'Apple']),
  ('0/1 Knapsack', 'zero-one-knapsack', 'Given weights and values, maximize total value within weight capacity.', 'Medium', 15, 42.8, ARRAY['Amazon', 'Microsoft']),
  ('Longest Common Subsequence', 'longest-common-subsequence', 'Find the length of the longest common subsequence of two strings.', 'Medium', 15, 58.3, ARRAY['Amazon', 'Google', 'Microsoft']),
  ('Coin Change', 'coin-change', 'Find the fewest number of coins to make up a given amount.', 'Medium', 15, 41.0, ARRAY['Amazon', 'Google']),
  ('Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Find the length of the longest strictly increasing subsequence.', 'Medium', 15, 53.1, ARRAY['Microsoft', 'Amazon', 'Google']),
  -- Binary Search
  ('Binary Search', 'binary-search', 'Given a sorted array and target, return index using binary search.', 'Easy', 11, 55.5, ARRAY['Amazon', 'Adobe']),
  ('Search in Rotated Sorted Array', 'search-rotated-sorted', 'Search for target in a rotated sorted array.', 'Medium', 11, 38.7, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  ('Find Minimum in Rotated Sorted Array', 'find-min-rotated', 'Find the minimum element in a rotated sorted array.', 'Medium', 11, 48.3, ARRAY['Amazon', 'Microsoft']),
  -- Graph Traversal
  ('Number of Islands', 'number-of-islands', 'Count distinct islands (connected 1s) in a 2D grid.', 'Medium', 19, 57.8, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Clone Graph', 'clone-graph', 'Return a deep copy of a connected undirected graph.', 'Medium', 19, 53.2, ARRAY['Facebook', 'Amazon', 'Microsoft']),
  ('Pacific Atlantic Water Flow', 'pacific-atlantic-water-flow', 'Find cells where water can flow to both Pacific and Atlantic oceans.', 'Medium', 19, 51.3, ARRAY['Amazon', 'Google']),
  -- Backtracking
  ('Subsets', 'subsets', 'Return all possible subsets (the power set) of an integer array.', 'Medium', 16, 74.1, ARRAY['Amazon', 'Facebook', 'Google']),
  ('Permutations', 'permutations', 'Return all possible permutations of a distinct integer array.', 'Medium', 16, 75.2, ARRAY['Microsoft', 'Amazon']),
  ('Word Search', 'word-search', 'Given a grid, find if the word exists using DFS/backtracking.', 'Medium', 16, 40.3, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  -- Two Heaps
  ('Find Median from Data Stream', 'find-median-data-stream', 'Design a data structure that supports median calculation of a stream.', 'Hard', 9, 50.6, ARRAY['Amazon', 'Google', 'Microsoft']),
  -- Merge Intervals
  ('Merge Intervals', 'merge-intervals', 'Merge all overlapping intervals and return non-overlapping intervals.', 'Medium', 4, 46.3, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Insert Interval', 'insert-interval', 'Insert a new interval into a list of non-overlapping intervals.', 'Medium', 4, 37.8, ARRAY['Google', 'LinkedIn']),
  -- Top K Elements
  ('Kth Largest Element in Array', 'kth-largest-element', 'Find the kth largest element in an unsorted array.', 'Medium', 13, 65.3, ARRAY['Facebook', 'Amazon', 'Microsoft']),
  ('Top K Frequent Elements', 'top-k-frequent', 'Given an integer array, return the k most frequent elements.', 'Medium', 13, 64.9, ARRAY['Amazon', 'Facebook', 'Google'])
ON CONFLICT (slug) DO NOTHING;
