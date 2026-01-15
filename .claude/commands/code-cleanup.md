# Automatic Cleanup Detection

Patterns to detect and fix common code quality issues.

## Detection Patterns & Fixes

### Infinite Loop Detection

**Detect When:**
- Functions with dependencies that aren't memoized
- Object literals recreated in dependency tracking
- Missing dependencies in change listeners
- Circular references between modules

**Fix Pattern:**
```typescript
// DETECTED:
function processData() {
  expensiveOperation = () => { /* computation */ }
  onDataChange(() => {
    expensiveOperation()
  }, [expensiveOperation]) // Function dependency detected
}

// FIX:
function processData() {
  expensiveOperation = useCallback(() => { /* computation */ }, [dependency1])
  onDataChange(() => {
    expensiveOperation()
  }, [expensiveOperation]) // Memoized function
}
```

### State Management Issues

**Detect When:**
- Excessive parameter passing (5+ parameters)
- Data drilling through 3+ layers
- Complex interdependent state logic
- State not being cleared on cleanup

**Fix Pattern:**
```typescript
// DETECTED:
function render(user, settings, permissions, theme, language) {
  return childComponent(user, settings, permissions, theme, language)
}

// FIX:
// Use Zustand store or context
const user = useStore((state) => state.user);
function render() {
  return <ChildComponent />;
}
```

### Module Size Violations

**Detect When:**
- Modules exceeding 400 lines
- Classes/modules with multiple unrelated responsibilities
- Single modules handling connection + UI + state + settings

**Fix Pattern:**
Use `/file-splitting` command to refactor.

### Resource Leak Detection

**Detect When:**
- Setup functions without cleanup return
- Event listeners added without removal
- Connections opened without cleanup
- Subscriptions without unsubscribe

**Fix Pattern:**
```typescript
// DETECTED:
function setupService() {
  subscription = dataSource.subscribe(callback)
  // No cleanup
}

// FIX:
function setupService() {
  subscription = dataSource.subscribe(callback)
  return () => { // Cleanup
    subscription.unsubscribe()
  }
}
```

### Type Safety Issues

**Detect When:**
- Usage of untyped parameters
- Missing null checks before property access
- Using `||` incorrectly for default values
- Undefined property access without safe navigation

**Fix Pattern:**
```typescript
// DETECTED:
const value = data.field || 'default'; // Wrong for 0 or ''

// FIX:
const value = data.field ?? 'default'; // Correct for nullish
```

### Race Condition Patterns

**Detect When:**
- State updates after async operations without validation
- Event processing without connection status checks
- Missing defensive checks in event handlers
- Stale state access in async callbacks

**Fix Pattern:**
```typescript
// DETECTED:
connection.onMessage((data) => {
  handleEvent(data) // No connection check
})

// FIX:
connection.onMessage((data) => {
  if (isConnected) { // Defensive check
    handleEvent(data)
  }
})
```

## Priority Levels

1. **Critical**: Infinite loops, memory leaks, race conditions
2. **Warning**: Module size, parameter drilling, type safety
3. **Info**: Code organization, documentation suggestions

## Detection Triggers

- **On Save**: Scan for patterns when modules are saved
- **On Review**: Highlight issues in code reviews
- **On Refactor**: Suggest improvements during changes
- **On Import**: Check for violations when importing large modules

## Quick Reference

| Issue | Detection | Fix |
|-------|-----------|-----|
| Infinite loop | Function in deps without useCallback | Add useCallback |
| Prop drilling | 5+ params or 3+ levels | Use Zustand store |
| Large file | >400 lines | Split using /file-splitting |
| Memory leak | Setup without cleanup | Return cleanup function |
| Type unsafe | any, missing guards | Add proper types |
| Race condition | No status check | Add defensive checks |
