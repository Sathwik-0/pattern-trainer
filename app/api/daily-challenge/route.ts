import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAILY_PROBLEMS = [
  { problem_text: "Given an array of integers nums and an integer k, return the number of contiguous subarrays where the product of all the elements in the subarray is strictly less than k.", correct_pattern: "Sliding Window" },
  { problem_text: "Given a sorted array nums, remove the duplicates in-place such that each element appears only once and return the new length.", correct_pattern: "Two Pointers" },
  { problem_text: "You are given an m x n integer matrix matrix with the following properties: each row is sorted in non-decreasing order, the first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in matrix or false otherwise.", correct_pattern: "Binary Search" },
  { problem_text: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.", correct_pattern: "Dynamic Programming" },
  { problem_text: "There are n cities. Some of them are connected, while some are not. If city a is connected directly with city b, and city b is connected directly with city c, then city a is connected indirectly with city c. A province is a group of directly or indirectly connected cities and no other cities outside of the group. You are given an n x n matrix isConnected where isConnected[i][j] = 1 if the ith city and the jth city are directly connected, and isConnected[i][j] = 0 otherwise. Return the total number of provinces.", correct_pattern: "Graph BFS/DFS" },
  { problem_text: "Given an array of non-negative integers representing the heights of walls, compute how much water it can trap after raining.", correct_pattern: "Two Pointers" },
  { problem_text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.", correct_pattern: "Dynamic Programming" },
  { problem_text: "Given a collection of candidate numbers and a target number, find all unique combinations in candidates where the candidate numbers sum to target.", correct_pattern: "Backtracking" },
  { problem_text: "Given a circular integer array nums, return the next greater number for every element. The next greater number of a number x is the first greater number to its right in the array, wrapping around.", correct_pattern: "Monotonic Stack" },
  { problem_text: "You have a list of points in the plane. Find the k closest points to the origin.", correct_pattern: "Heap/Priority Queue" },
]

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', today)
    .single()

  if (existing) return NextResponse.json(existing)

  // Pick problem by day-of-year index
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const pick = DAILY_PROBLEMS[dayOfYear % DAILY_PROBLEMS.length]

  const { data: created } = await supabase
    .from('daily_challenges')
    .insert({ challenge_date: today, ...pick })
    .select()
    .single()

  return NextResponse.json(created)
}
