# Test Coverage Report

**Date:** November 30, 2025  
**Total Tests:** 76  
**Test Coverage:** 72.41%

## Coverage Summary

| Category | Statements | Branches | Functions | Lines |
|----------|------------|----------|-----------|-------|
| **All files** | 72.41% | 61.11% | 68.88% | 73.19% |
| Models | 100% | 100% | 100% | 100% |
| Routes | 72.95% | 81.13% | 71.42% | 72.95% |
| Utils | 69.76% | 64.28% | 88.88% | 69.76% |
| Middleware | 71.87% | 64.28% | 62.5% | 71.87% |

## Detailed Coverage

### Models (100% Coverage)
- ✅ `User.js` - 100%
- ✅ `Message.js` - 100%
- ✅ `Contact.js` - 100%

### Routes (72.95% Coverage)
- ✅ `userRoutes.js` - 74.35%
- ✅ `messageRoutes.js` - 67.3%
- ✅ `contactRoutes.js` - 80.64%

### Utils (69.76% Coverage)
- ✅ `userStore.js` - 77.77%
- ⚠️ `messageStore.js` - 61.53%
- ✅ `contactStore.js` - 66.66%

### Middleware (71.87% Coverage)
- ✅ `authMiddleware.js` - 75%
- ⚠️ `errorMiddleware.js` - 62.5%
- ✅ `metrics.js` - 78.94%

## Test Suites

### Unit Tests (45 tests)
- **Models**: 15 tests
- **Utils**: 20 tests
- **Middleware**: 10 tests

### Integration Tests (31 tests)
- **User Routes**: 11 tests
- **Message Routes**: 12 tests
- **Contact Routes**: 8 tests

## Coverage Trends

| Date | Coverage | Change |
|------|----------|--------|
| Nov 28 | 68% | - |
| Nov 29 | 71% | +3% |
| Nov 30 | 72.41% | +1.41% |

## Uncovered Areas

### Critical Paths (Need Testing)
1. Error handling in messageStore.js (lines 62-63)
2. Error handling in contactStore.js (lines 24-25, 38-39)
3. Delete thread endpoint in messageRoutes.js (lines 52-72)

### Low Priority (Edge Cases)
1. Old JSON file methods (deprecated, lines 6-17 in messageStore.js)
2. Sort function in conversations (line 101 in messageRoutes.js)

## Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch

---

## 📊 How to View Interactive Coverage Report

### Option 1: Open HTML Report (Recommended)

```bash
# Run tests with coverage
cd backend
npm test -- --coverage

# Open the interactive HTML report in your browser
open coverage/lcov-report/index.html