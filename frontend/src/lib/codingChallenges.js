// Interactive Coding Simulation Challenges & In-Browser Runner

export const CODING_CHALLENGES = [
  {
    id: "two-sum",
    title: "1. Two Sum (Hash Map Lookup)",
    difficulty: "Easy",
    category: "Arrays & Hash Table",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explanation: "nums[1] + nums[2] == 6." },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> lookup;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (lookup.count(comp)) return {lookup[comp], i};
            lookup[nums[i]] = i;
        }
        return {};
    }
};`,
      sql: `-- SQL Alternative: Self-join on pair sum
SELECT a.id AS idx1, b.id AS idx2
FROM Numbers a
JOIN Numbers b ON a.id < b.id
WHERE a.val + b.val = 9;`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    executeJs: (userCode, testCase) => {
      // Evaluate function in safe context
      const fn = new Function(`${userCode}; return twoSum;`)();
      return fn(testCase.input.nums, testCase.input.target);
    },
  },
  {
    id: "valid-palindrome",
    title: "2. Valid Palindrome (Two Pointers)",
    difficulty: "Easy",
    category: "Strings & Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false", explanation: '"raceacar" is not a palindrome.' },
    ],
    starterCode: {
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
      python: `def is_palindrome(s: str) -> bool:
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]`,
      cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++; r--;
        }
        return true;
    }
};`,
      sql: `-- SQL Palindrome Check
SELECT text_str, (text_str = REVERSE(text_str)) AS is_palindrome
FROM StringsTable;`,
    },
    testCases: [
      { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
      { input: { s: "race a car" }, expected: false },
      { input: { s: " " }, expected: true },
    ],
    executeJs: (userCode, testCase) => {
      const fn = new Function(`${userCode}; return isPalindrome;`)();
      return fn(testCase.input.s);
    },
  },
  {
    id: "max-subarray",
    title: "3. Maximum Subarray (Kadane's Algorithm)",
    difficulty: "Medium",
    category: "Dynamic Programming",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "The subarray [1] has the largest sum 1." },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
      python: `def max_sub_array(nums: list[int]) -> int:
    max_so_far = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)
        max_so_far = max(max_so_far, current)
    return max_so_far`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSoFar = nums[0], curr = nums[0];
        for (size_t i = 1; i < nums.size(); ++i) {
            curr = max(nums[i], curr + nums[i]);
            maxSoFar = max(maxSoFar, curr);
        }
        return maxSoFar;
    }
};`,
      sql: `-- Kadane's Running Cumulative Window in SQL
SELECT MAX(running_sum) 
FROM (
  SELECT SUM(val) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_sum
  FROM SubarrayData
);`,
    },
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
      { input: { nums: [1] }, expected: 1 },
      { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
    ],
    executeJs: (userCode, testCase) => {
      const fn = new Function(`${userCode}; return maxSubArray;`)();
      return fn(testCase.input.nums);
    },
  },
  {
    id: "climbing-stairs",
    title: "4. Climbing Stairs (Fibonacci DP)",
    difficulty: "Easy",
    category: "Dynamic Programming",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "1 step + 1 step, or 2 steps." },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, or 2+1." },
    ],
    starterCode: {
      javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
      python: `def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
      sql: `-- Recursive CTE Fibonacci Staircase
WITH RECURSIVE Stairs(step, ways_prev, ways_curr) AS (
  SELECT 1, 1, 1
  UNION ALL
  SELECT step + 1, ways_curr, ways_prev + ways_curr
  FROM Stairs WHERE step < 5
)
SELECT ways_curr FROM Stairs WHERE step = 5;`,
    },
    testCases: [
      { input: { n: 2 }, expected: 2 },
      { input: { n: 3 }, expected: 3 },
      { input: { n: 5 }, expected: 8 },
    ],
    executeJs: (userCode, testCase) => {
      const fn = new Function(`${userCode}; return climbStairs;`)();
      return fn(testCase.input.n);
    },
  },
];
