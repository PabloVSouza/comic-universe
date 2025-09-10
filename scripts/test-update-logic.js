#!/usr/bin/env node

/**
 * Test script for update logic validation
 * This script tests the version type validation logic to ensure
 * cross-type updates are properly prevented.
 */

// Helper functions (copied from the main code)
function getVersionTypeString(version) {
  if (version.includes('alpha')) return 'alpha'
  if (version.includes('beta')) return 'beta'
  return 'stable'
}

function isValidUpdateTransition(
  current,
  available,
  settings
) {
  // If user has opted into non-stable releases, allow more flexible transitions
  if (settings.optInNonStable) {
    // If user allows alpha releases, allow any transition to alpha
    if (available.isAlpha && settings.releaseTypes.includes('alpha')) {
      return true
    }
    
    // If user allows beta releases, allow any transition to beta
    if (available.isBeta && settings.releaseTypes.includes('beta')) {
      return true
    }
    
    // If user allows stable releases, allow any transition to stable
    if (available.isStable && settings.releaseTypes.includes('stable')) {
      return true
    }
  }

  // Default conservative transitions (when optInNonStable is false)
  // Stable can update to stable (newer stable versions)
  if (current.isStable && available.isStable) {
    return true
  }

  // Beta can update to beta (newer beta versions) or stable
  if (current.isBeta && (available.isBeta || available.isStable)) {
    return true
  }

  // Alpha can update to alpha (newer alpha versions), beta, or stable
  if (current.isAlpha && (available.isAlpha || available.isBeta || available.isStable)) {
    return true
  }

  // All other transitions are invalid when not opted into non-stable
  return false
}

function getVersionType(version) {
  const isStable = !version.includes('alpha') && !version.includes('beta')
  const isBeta = version.includes('beta')
  const isAlpha = version.includes('alpha')
  return { isStable, isBeta, isAlpha }
}

// Test cases
const testCases = [
  // Conservative settings (optInNonStable: false, only stable allowed)
  { current: '2.0.0', available: '2.0.1', expected: true, description: 'Stable to newer stable (conservative)', settings: { optInNonStable: false, releaseTypes: ['stable'] } },
  { current: '2.0.0', available: '2.0.0-beta.1', expected: false, description: 'Stable to beta (conservative - should be invalid)', settings: { optInNonStable: false, releaseTypes: ['stable'] } },
  { current: '2.0.0-beta.1', available: '2.0.0-alpha.1', expected: false, description: 'Beta to alpha (conservative - should be invalid)', settings: { optInNonStable: false, releaseTypes: ['stable'] } },
  
  // Beta allowed settings (optInNonStable: true, stable + beta allowed)
  { current: '2.0.0-beta.1', available: '2.0.0-beta.2', expected: true, description: 'Beta to newer beta (beta allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta'] } },
  { current: '2.0.0-beta.1', available: '2.0.0', expected: true, description: 'Beta to stable (beta allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta'] } },
  { current: '2.0.0', available: '2.0.0-beta.1', expected: true, description: 'Stable to beta (beta allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta'] } },
  { current: '2.0.0-beta.1', available: '2.0.0-alpha.1', expected: false, description: 'Beta to alpha (alpha not allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta'] } },
  
  // Alpha allowed settings (optInNonStable: true, all types allowed)
  { current: '2.0.0-alpha.1', available: '2.0.0-alpha.2', expected: true, description: 'Alpha to newer alpha (alpha allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta', 'alpha'] } },
  { current: '2.0.0-alpha.1', available: '2.0.0-beta.1', expected: true, description: 'Alpha to beta (alpha allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta', 'alpha'] } },
  { current: '2.0.0-alpha.1', available: '2.0.0', expected: true, description: 'Alpha to stable (alpha allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta', 'alpha'] } },
  { current: '2.0.0-beta.1', available: '2.0.0-alpha.1', expected: true, description: 'Beta to alpha (alpha allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta', 'alpha'] } },
  { current: '2.0.0', available: '2.0.0-alpha.1', expected: true, description: 'Stable to alpha (alpha allowed)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta', 'alpha'] } },
  
  // Version downgrade tests (type transitions should still be valid)
  { current: '2.0.0-beta.2', available: '2.0.0-beta.1', expected: true, description: 'Newer beta to older beta (type transition valid)', settings: { optInNonStable: true, releaseTypes: ['stable', 'beta'] } },
  { current: '2.0.0', available: '1.9.9', expected: true, description: 'Newer stable to older stable (type transition valid)', settings: { optInNonStable: false, releaseTypes: ['stable'] } },
]

console.log('🧪 Testing Update Logic Validation\n')
console.log('=' * 60)

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const currentType = getVersionType(testCase.current)
  const availableType = getVersionType(testCase.available)
  const result = isValidUpdateTransition(currentType, availableType, testCase.settings)
  
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL'
  const currentTypeStr = getVersionTypeString(testCase.current)
  const availableTypeStr = getVersionTypeString(testCase.available)
  
  console.log(`Test ${index + 1}: ${status}`)
  console.log(`  ${testCase.description}`)
  console.log(`  ${testCase.current} (${currentTypeStr}) → ${testCase.available} (${availableTypeStr})`)
  console.log(`  Settings: optInNonStable=${testCase.settings.optInNonStable}, releaseTypes=[${testCase.settings.releaseTypes.join(', ')}]`)
  console.log(`  Expected: ${testCase.expected}, Got: ${result}`)
  console.log('')
  
  if (result === testCase.expected) {
    passed++
  } else {
    failed++
  }
})

console.log('=' * 60)
console.log(`📊 Results: ${passed} passed, ${failed} failed`)

if (failed === 0) {
  console.log('🎉 All tests passed! Update logic is working correctly.')
  process.exit(0)
} else {
  console.log('💥 Some tests failed. Please review the update logic.')
  process.exit(1)
}
